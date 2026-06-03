import { prisma } from "../config/prisma.js";
import { writeAuditLog } from "../services/audit.service.js";
import { createNotification } from "../services/notification.service.js";

const sizeFromDb = {
  SIZE_1_5_LB: "1.5 lb",
  SIZE_5_LB: "5 lb",
  SIZE_9_LB: "9 lb",
  SIZE_12_LB: "12 lb",
};

const toApi = (ext) => ({
  id: ext.id,
  serialNumber: ext.serialNumber,
  location: ext.location,
  building: ext.building,
  floor: ext.floor,
  zone: ext.zone,
  type: ext.type,
  size: sizeFromDb[ext.size] || ext.size,
  installationDate: ext.installationDate?.toISOString().slice(0, 10),
  expiryDate: ext.expiryDate?.toISOString().slice(0, 10),
  status: ext.status,
  assignmentStatus: ext.assignment ? "ASSIGNED" : "NOT_ASSIGNED",
  createdAt: ext.createdAt,
  updatedAt: ext.updatedAt,
  assignment: ext.assignment
    ? {
        id: ext.assignment.id,
        assignedUserId: ext.assignment.assignedUserId,
        assignedByAdminId: ext.assignment.assignedByAdminId,
        assignedAt: ext.assignment.assignedAt,
        notes: ext.assignment.notes,
      }
    : null,
});

const findExtinguisherOrThrow = async (id) => {
  const ext = await prisma.fireExtinguisher.findUnique({
    where: { id },
    include: { assignment: true },
  });

  if (!ext) {
    const error = new Error("Fire extinguisher not found");
    error.statusCode = 404;
    error.code = "EXTINGUISHER_NOT_FOUND";
    throw error;
  }

  return ext;
};

// POST /api/extinguishers/:id/assign
export const assignExtinguisher = async (req, res, next) => {
  try {
    const { assignedUserId, notes } = req.body;
    const adminId = req.user.sub;

    const ext = await findExtinguisherOrThrow(req.params.id);

    if (ext.status === "RETIRED") {
      const error = new Error("Cannot assign a retired extinguisher");
      error.statusCode = 400;
      error.code = "EXTINGUISHER_RETIRED";
      throw error;
    }

    // Upsert: if already assigned to someone, replace the assignment
    const assignment = await prisma.extinguisherAssignment.upsert({
      where: { extinguisherId: ext.id },
      create: {
        extinguisherId: ext.id,
        assignedUserId,
        assignedByAdminId: adminId,
        notes: notes || null,
      },
      update: {
        assignedUserId,
        assignedByAdminId: adminId,
        assignedAt: new Date(),
        notes: notes || null,
      },
    });

    // Notify the assigned user
    await createNotification({
      req,
      userId: assignedUserId,
      type: "EXTINGUISHER_ASSIGNED",
      title: "Fire extinguisher assigned to you",
      message: `Extinguisher ${ext.serialNumber} (${ext.location}) has been assigned to you.`,
      metadata: { extinguisherId: ext.id, serialNumber: ext.serialNumber },
    });

    // Notify the admin who performed the action
    await createNotification({
      req,
      userId: adminId,
      type: "EXTINGUISHER_ASSIGNMENT_CONFIRMED",
      title: "Assignment confirmed",
      message: `Extinguisher ${ext.serialNumber} has been successfully assigned to user ${assignedUserId}.`,
      metadata: { extinguisherId: ext.id, assignedUserId },
    });

    await writeAuditLog({
      req,
      action: "EXTINGUISHER_ASSIGNED",
      resourceId: ext.id,
      outcome: "SUCCESS",
      metadata: { serialNumber: ext.serialNumber, assignedUserId },
    });

    res.status(201).json({
      success: true,
      data: {
        assignment: {
          id: assignment.id,
          extinguisherId: assignment.extinguisherId,
          assignedUserId: assignment.assignedUserId,
          assignedByAdminId: assignment.assignedByAdminId,
          assignedAt: assignment.assignedAt,
          notes: assignment.notes,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/extinguishers/my
export const listMyExtinguishers = async (req, res, next) => {
  try {
    const userId = req.user.profileId || req.user.sub;
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);

    const where = {
      assignment: { assignedUserId: userId },
    };

    if (req.query.status) where.status = req.query.status;

    const [items, total] = await Promise.all([
      prisma.fireExtinguisher.findMany({
        where,
        include: { assignment: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.fireExtinguisher.count({ where }),
    ]);

    res.json({
      success: true,
      data: items.map(toApi),
      meta: { page, limit, total },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/extinguishers/:id/assignment
export const removeAssignment = async (req, res, next) => {
  try {
    const ext = await findExtinguisherOrThrow(req.params.id);

    if (!ext.assignment) {
      const error = new Error("This extinguisher has no active assignment");
      error.statusCode = 404;
      error.code = "ASSIGNMENT_NOT_FOUND";
      throw error;
    }

    const { assignedUserId } = ext.assignment;

    await prisma.extinguisherAssignment.delete({
      where: { extinguisherId: ext.id },
    });

    await createNotification({
      req,
      userId: assignedUserId,
      type: "EXTINGUISHER_UNASSIGNED",
      title: "Fire extinguisher unassigned",
      message: `Extinguisher ${ext.serialNumber} (${ext.location}) has been unassigned from you.`,
      metadata: { extinguisherId: ext.id, serialNumber: ext.serialNumber },
    });

    await writeAuditLog({
      req,
      action: "EXTINGUISHER_UNASSIGNED",
      resourceId: ext.id,
      outcome: "SUCCESS",
      metadata: { serialNumber: ext.serialNumber, previousUserId: assignedUserId },
    });

    res.json({ success: true, message: "Assignment removed successfully" });
  } catch (error) {
    next(error);
  }
};
