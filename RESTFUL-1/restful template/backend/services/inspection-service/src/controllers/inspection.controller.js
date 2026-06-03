import { prisma } from "../config/prisma.js";
import { writeAuditLog } from "../services/audit.service.js";
import { getExtinguisher } from "../services/extinguisher-service.client.js";
import { createNotification } from "../services/notification-service.client.js";
import { validateInspector } from "../services/user-service.client.js";

const toDate = (value) => (value ? new Date(value) : value);

const scheduledDateTime = (inspection) => new Date(`${inspection.inspectionDate.toISOString().slice(0, 10)}T${inspection.inspectionTime}:00`);

const toApi = (inspection) => ({
  id: inspection.id,
  extinguisherId: inspection.extinguisherId,
  scheduledByUserId: inspection.scheduledByUserId,
  assignedInspectorId: inspection.assignedInspectorId,
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
    if (inspection.status === "SCHEDULED" && scheduledDateTime(inspection) < now) {
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

export const scheduleInspection = async (req, res, next) => {
  try {
    await getExtinguisher({ req, extinguisherId: req.body.extinguisherId });
    if (req.body.assignedInspectorId) {
      await validateInspector({ req, userId: req.body.assignedInspectorId });
    }

    const inspection = await prisma.inspection.create({
      data: {
        extinguisherId: req.body.extinguisherId,
        scheduledByUserId: req.user.sub,
        assignedInspectorId: req.body.assignedInspectorId || null,
        inspectionDate: toDate(req.body.inspectionDate),
        inspectionTime: req.body.inspectionTime,
      },
    });

    await createNotification({
      req,
      userId: inspection.assignedInspectorId || inspection.scheduledByUserId,
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

    res.status(201).json({ success: true, data: toApi(inspection) });
  } catch (error) {
    next(error);
  }
};

export const listInspections = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const where = {};

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

export const getInspectionById = async (req, res, next) => {
  try {
    const inspection = await markOverdue(req, await findInspectionOrThrow(req.params.id));
    res.json({ success: true, data: toApi(inspection) });
  } catch (error) {
    next(error);
  }
};

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

export const completeInspection = async (req, res, next) => {
  try {
    const current = await findInspectionOrThrow(req.params.id);
    ensureMutable(current);

    const inspection = await prisma.inspection.update({
      where: { id: current.id },
      data: {
        status: "COMPLETED",
        result: req.body.result,
        resultNotes: req.body.resultNotes || null,
        completedAt: new Date(),
      },
    });

    await createNotification({
      req,
      userId: inspection.scheduledByUserId,
      type: "INSPECTION_COMPLETED",
      title: "Inspection completed",
      message: `Inspection ${inspection.id} was completed`,
      metadata: { inspectionId: inspection.id, result: inspection.result },
    });

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
      userId: inspection.assignedInspectorId || inspection.scheduledByUserId,
      type: "INSPECTION_CANCELLED",
      title: "Inspection cancelled",
      message: `Inspection ${inspection.id} was cancelled`,
      metadata: { inspectionId: inspection.id, reason: inspection.cancelReason },
    });

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
