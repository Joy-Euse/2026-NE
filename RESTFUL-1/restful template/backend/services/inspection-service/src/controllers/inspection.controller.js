import { prisma } from "../config/prisma.js";
import { writeAuditLog } from "../services/audit.service.js";
import { getExtinguisher } from "../services/extinguisher-service.client.js";
import { createNotification } from "../services/notification-service.client.js";
import { validateInspector, getInternalUser } from "../services/user-service.client.js";
import { verifyUserAssignment } from "../services/assignment-service.client.js";

const toDate = (value) => (value ? new Date(value) : value);

const scheduledDateTime = (inspection) =>
  new Date(`${inspection.inspectionDate.toISOString().slice(0, 10)}T${inspection.inspectionTime}:00`);

const toApi = (inspection) => ({
  id: inspection.id,
  extinguisherId: inspection.extinguisherId,
  scheduledByUserId: inspection.scheduledByUserId,
  assignedInspectorId: inspection.assignedInspectorId,
  assignedByAdminId: inspection.assignedByAdminId,
  inspectionDate: inspection.inspectionDate?.toISOString().slice(0, 10),
  inspectionTime: inspection.inspectionTime,
  status: inspection.status,
  result: inspection.result,
  resultNotes: inspection.resultNotes,
  cancelReason: inspection.cancelReason,
  completedAt: inspection.completedAt,
  cancelledAt: inspection.cancelledAt,
  createdAt: inspection.createdAt,
  updatedAt: inspection.updatedAt,
});

const requesterUserId = (req) => req.user.profileId || req.user.sub;

const findInspectionOrThrow = async (id) => {
  const inspection = await prisma.inspection.findUnique({ where: { id } });

  if (!inspection) {
    const error = new Error("Inspection not found");
    error.statusCode = 404;
    error.code = "INSPECTION_NOT_FOUND";
    throw error;
  }

  return inspection;
};

const ensureMutable = (inspection) => {
  if (["COMPLETED", "CANCELLED"].includes(inspection.status)) {
    const error = new Error("Completed or cancelled inspections cannot be modified");
    error.statusCode = 400;
    error.code = "INSPECTION_NOT_MUTABLE";
    throw error;
  }
};

const markOverdue = async (req, inspections) => {
  const items = Array.isArray(inspections) ? inspections : [inspections];
  const now = new Date();
  const updated = [];

  for (const inspection of items) {
    // Only ASSIGNED or SCHEDULED inspections can become overdue
    if (
      ["ASSIGNED", "SCHEDULED"].includes(inspection.status) &&
      scheduledDateTime(inspection) < now
    ) {
      const overdue = await prisma.inspection.update({
        where: { id: inspection.id },
        data: { status: "OVERDUE" },
      });

      updated.push(overdue);

      await createNotification({
        req,
        userId: overdue.assignedInspectorId || overdue.scheduledByUserId,
        type: "INSPECTION_OVERDUE",
        title: "Inspection overdue",
        message: `Inspection ${overdue.id} is overdue`,
        metadata: { inspectionId: overdue.id, extinguisherId: overdue.extinguisherId },
      });

      await writeAuditLog({
        req,
        action: "INSPECTION_MARKED_OVERDUE",
        resourceType: "INSPECTION",
        resourceId: overdue.id,
        outcome: "SUCCESS",
      });
    } else {
      updated.push(inspection);
    }
  }

  return Array.isArray(inspections) ? updated : updated[0];
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/inspections
// Role: USER  → must own the extinguisher (status = REQUESTED)
//       ADMIN/INSPECTOR → can schedule freely (status = SCHEDULED)
// ─────────────────────────────────────────────────────────────────────────────
export const scheduleInspection = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = requesterUserId(req);

    if (role === "USER") {
      // Verify extinguisher is assigned to this user
      await verifyUserAssignment({ req, extinguisherId: req.body.extinguisherId, userId });
    } else {
      // ADMIN / INSPECTOR: just check the extinguisher exists and isn't retired
      await getExtinguisher({ req, extinguisherId: req.body.extinguisherId });
    }

    if (req.body.assignedInspectorId) {
      await validateInspector({ req, userId: req.body.assignedInspectorId });
    }

    // USERs create a REQUESTED inspection; ADMIN/INSPECTOR create a SCHEDULED one
    const initialStatus = role === "USER" ? "REQUESTED" : "SCHEDULED";

    const inspection = await prisma.inspection.create({
      data: {
        extinguisherId: req.body.extinguisherId,
        scheduledByUserId: userId,
        assignedInspectorId: req.body.assignedInspectorId || null,
        assignedByAdminId: null,
        inspectionDate: toDate(req.body.inspectionDate),
        inspectionTime: req.body.inspectionTime,
        status: initialStatus,
      },
    });

    if (role === "USER") {
      // Notify all admins — in practice: notify the system (no admin id known here,
      // so we log the audit and let admins pick it up from the list)
      await writeAuditLog({
        req,
        actorUserId: userId,
        action: "INSPECTION_REQUESTED",
        resourceType: "INSPECTION",
        resourceId: inspection.id,
        outcome: "SUCCESS",
        metadata: { extinguisherId: inspection.extinguisherId },
      });
    } else {
      await createNotification({
        req,
        userId: inspection.assignedInspectorId || userId,
        type: "INSPECTION_SCHEDULED",
        title: "Inspection scheduled",
        message: `Inspection scheduled for ${toApi(inspection).inspectionDate} at ${inspection.inspectionTime}`,
        metadata: { inspectionId: inspection.id, extinguisherId: inspection.extinguisherId },
      });

      await writeAuditLog({
        req,
        action: "INSPECTION_SCHEDULED",
        resourceType: "INSPECTION",
        resourceId: inspection.id,
        outcome: "SUCCESS",
        metadata: { extinguisherId: inspection.extinguisherId },
      });
    }

    res.status(201).json({ success: true, data: toApi(inspection) });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/inspections/:id/assign-inspector
// Role: ADMIN only
// ─────────────────────────────────────────────────────────────────────────────
export const assignInspector = async (req, res, next) => {
  try {
    const current = await findInspectionOrThrow(req.params.id);

    if (!["REQUESTED", "ASSIGNED"].includes(current.status)) {
      const error = new Error("Inspector can only be assigned to REQUESTED or ASSIGNED inspections");
      error.statusCode = 400;
      error.code = "INVALID_INSPECTION_STATUS";
      throw error;
    }

    await validateInspector({ req, userId: req.body.assignedInspectorId });

    const inspection = await prisma.inspection.update({
      where: { id: current.id },
      data: {
        assignedInspectorId: req.body.assignedInspectorId,
        assignedByAdminId: req.user.sub,
        status: "ASSIGNED",
      },
    });

    // Notify the inspector
    await createNotification({
      req,
      userId: inspection.assignedInspectorId,
      type: "INSPECTION_INSPECTOR_ASSIGNED",
      title: "You have been assigned an inspection",
      message: `You have been assigned to inspect extinguisher on ${toApi(inspection).inspectionDate} at ${inspection.inspectionTime}.`,
      metadata: { inspectionId: inspection.id, extinguisherId: inspection.extinguisherId },
    });

    // Notify the requesting user
    await createNotification({
      req,
      userId: inspection.scheduledByUserId,
      type: "INSPECTION_INSPECTOR_ASSIGNED",
      title: "Your inspection has been assigned",
      message: `An inspector has been assigned to your requested inspection on ${toApi(inspection).inspectionDate}.`,
      metadata: { inspectionId: inspection.id, extinguisherId: inspection.extinguisherId },
    });

    await writeAuditLog({
      req,
      action: "INSPECTION_INSPECTOR_ASSIGNED",
      resourceType: "INSPECTION",
      resourceId: inspection.id,
      outcome: "SUCCESS",
      metadata: {
        assignedInspectorId: inspection.assignedInspectorId,
        assignedByAdminId: inspection.assignedByAdminId,
      },
    });

    res.json({ success: true, data: toApi(inspection) });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/inspections
// ─────────────────────────────────────────────────────────────────────────────
export const listInspections = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const role = req.user.role;
    const userId = requesterUserId(req);

    const where = {};

    // USERs only see inspections they requested
    if (role === "USER") where.scheduledByUserId = userId;
    // INSPECTORs see inspections assigned to them or all (admin-like view)
    if (role === "INSPECTOR") {
      where.OR = [{ assignedInspectorId: userId }, { assignedInspectorId: null }];
    }

    if (req.query.status) where.status = req.query.status;
    if (req.query.extinguisherId) where.extinguisherId = req.query.extinguisherId;
    if (req.query.assignedInspectorId) where.assignedInspectorId = req.query.assignedInspectorId;
    if (req.query.fromDate || req.query.toDate) {
      where.inspectionDate = {};
      if (req.query.fromDate) where.inspectionDate.gte = new Date(req.query.fromDate);
      if (req.query.toDate) where.inspectionDate.lte = new Date(req.query.toDate);
    }

    const [rawItems, total] = await Promise.all([
      prisma.inspection.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ inspectionDate: "asc" }, { inspectionTime: "asc" }],
      }),
      prisma.inspection.count({ where }),
    ]);

    const items = await markOverdue(req, rawItems);

    res.json({
      success: true,
      data: items.map(toApi),
      meta: { page, limit, total },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/inspections/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getInspectionById = async (req, res, next) => {
  try {
    const raw = await findInspectionOrThrow(req.params.id);
    const role = req.user.role;
    const userId = requesterUserId(req);

    // USERs can only view their own inspections
    if (role === "USER" && raw.scheduledByUserId !== userId) {
      const error = new Error("Inspection not found");
      error.statusCode = 404;
      error.code = "INSPECTION_NOT_FOUND";
      throw error;
    }

    const inspection = await markOverdue(req, raw);
    res.json({ success: true, data: toApi(inspection) });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/inspections/:id  (ADMIN / INSPECTOR — reschedule)
// ─────────────────────────────────────────────────────────────────────────────
export const updateInspection = async (req, res, next) => {
  try {
    const current = await findInspectionOrThrow(req.params.id);
    ensureMutable(current);

    if (req.body.extinguisherId) {
      await getExtinguisher({ req, extinguisherId: req.body.extinguisherId });
    }

    if (req.body.assignedInspectorId) {
      await validateInspector({ req, userId: req.body.assignedInspectorId });
    }

    const inspection = await prisma.inspection.update({
      where: { id: current.id },
      data: {
        extinguisherId: req.body.extinguisherId,
        assignedInspectorId: req.body.assignedInspectorId,
        inspectionDate: toDate(req.body.inspectionDate),
        inspectionTime: req.body.inspectionTime,
      },
    });

    await writeAuditLog({
      req,
      action: "INSPECTION_UPDATED",
      resourceType: "INSPECTION",
      resourceId: inspection.id,
      outcome: "SUCCESS",
    });

    res.json({ success: true, data: toApi(inspection) });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/inspections/:id/complete  (INSPECTOR or ADMIN)
// ─────────────────────────────────────────────────────────────────────────────
export const completeInspection = async (req, res, next) => {
  try {
    const current = await findInspectionOrThrow(req.params.id);
    ensureMutable(current);

    // INSPECTOR can only complete inspections assigned to them
    if (req.user.role === "INSPECTOR" && current.assignedInspectorId !== requesterUserId(req)) {
      const error = new Error("You can only complete inspections assigned to you");
      error.statusCode = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    const inspection = await prisma.inspection.update({
      where: { id: current.id },
      data: {
        status: "COMPLETED",
        result: req.body.result,
        resultNotes: req.body.resultNotes || null,
        completedAt: new Date(),
      },
    });

    // Notify the requesting user
    await createNotification({
      req,
      userId: inspection.scheduledByUserId,
      type: "INSPECTION_COMPLETED",
      title: "Your inspection has been completed",
      message: `Inspection for extinguisher ${inspection.extinguisherId} was completed with result: ${inspection.result}.`,
      metadata: { inspectionId: inspection.id, result: inspection.result },
    });

    // Notify admins — notify the admin who assigned the inspector (if known)
    if (inspection.assignedByAdminId && inspection.assignedByAdminId !== inspection.scheduledByUserId) {
      await createNotification({
        req,
        userId: inspection.assignedByAdminId,
        type: "INSPECTION_COMPLETED",
        title: "Inspection completed",
        message: `Inspection ${inspection.id} was completed with result: ${inspection.result}.`,
        metadata: { inspectionId: inspection.id, result: inspection.result },
      });
    }

    await writeAuditLog({
      req,
      action: "INSPECTION_COMPLETED",
      resourceType: "INSPECTION",
      resourceId: inspection.id,
      outcome: "SUCCESS",
      metadata: { result: inspection.result },
    });

    res.json({ success: true, data: toApi(inspection) });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/inspections/:id/cancel  (ADMIN or INSPECTOR)
// ─────────────────────────────────────────────────────────────────────────────
export const cancelInspection = async (req, res, next) => {
  try {
    const current = await findInspectionOrThrow(req.params.id);
    ensureMutable(current);

    const inspection = await prisma.inspection.update({
      where: { id: current.id },
      data: {
        status: "CANCELLED",
        cancelReason: req.body.cancelReason || null,
        cancelledAt: new Date(),
      },
    });

    await createNotification({
      req,
      userId: inspection.scheduledByUserId,
      type: "INSPECTION_CANCELLED",
      title: "Inspection cancelled",
      message: `Your inspection ${inspection.id} was cancelled.${inspection.cancelReason ? ` Reason: ${inspection.cancelReason}` : ""}`,
      metadata: { inspectionId: inspection.id, reason: inspection.cancelReason },
    });

    if (inspection.assignedInspectorId) {
      await createNotification({
        req,
        userId: inspection.assignedInspectorId,
        type: "INSPECTION_CANCELLED",
        title: "Assigned inspection cancelled",
        message: `Inspection ${inspection.id} assigned to you has been cancelled.`,
        metadata: { inspectionId: inspection.id, reason: inspection.cancelReason },
      });
    }

    await writeAuditLog({
      req,
      action: "INSPECTION_CANCELLED",
      resourceType: "INSPECTION",
      resourceId: inspection.id,
      outcome: "SUCCESS",
    });

    res.json({ success: true, data: toApi(inspection) });
  } catch (error) {
    next(error);
  }
};
