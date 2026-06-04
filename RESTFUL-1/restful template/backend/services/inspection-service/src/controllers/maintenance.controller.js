import { prisma } from "../config/prisma.js";
import { writeAuditLog } from "../services/audit.service.js";
import { getExtinguisher } from "../services/extinguisher-service.client.js";
import { createNotification } from "../services/notification-service.client.js";
import { getInternalUser } from "../services/user-service.client.js";

const toDate = (value) => (value ? new Date(value) : value);

const toApi = (log) => ({
  id: log.id,
  extinguisherId: log.extinguisherId,
  inspectionId: log.inspectionId,
  inspectorId: log.inspectorId,
  inspectorName: log.inspectorName || null,
  actionTaken: log.actionTaken,
  maintenanceDate: log.maintenanceDate?.toISOString().slice(0, 10),
  issuesIdentified: log.issuesIdentified,
  notes: log.notes,
  recommendations: log.recommendations,
  createdAt: log.createdAt,
  updatedAt: log.updatedAt,
});

const userDisplayName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || user?.email || null;

const currentUserId = (req) => req.user.profileId || req.user.sub;

const withInspectorName = async (req, log) => {
  try {
    const inspector = await getInternalUser({ req, userId: log.inspectorId });
    return { ...log, inspectorName: userDisplayName(inspector) };
  } catch {
    return { ...log, inspectorName: null };
  }
};

const withInspectorNames = async (req, logs) => {
  const uniqueInspectorIds = [...new Set(logs.map((log) => log.inspectorId).filter(Boolean))];
  const names = new Map();

  await Promise.all(uniqueInspectorIds.map(async (inspectorId) => {
    try {
      const inspector = await getInternalUser({ req, userId: inspectorId });
      names.set(inspectorId, userDisplayName(inspector));
    } catch {
      names.set(inspectorId, null);
    }
  }));

  return logs.map((log) => ({ ...log, inspectorName: names.get(log.inspectorId) || null }));
};

const findMaintenanceOrThrow = async (id) => {
  const log = await prisma.maintenanceLog.findUnique({ where: { id } });
  if (!log) {
    const error = new Error("Maintenance log not found");
    error.statusCode = 404;
    error.code = "MAINTENANCE_LOG_NOT_FOUND";
    throw error;
  }
  return log;
};

export const createMaintenance = async (req, res, next) => {
  try {
    await getExtinguisher({ req, extinguisherId: req.body.extinguisherId });

    if (req.body.inspectionId) {
      const inspection = await prisma.inspection.findUnique({ where: { id: req.body.inspectionId } });
      if (!inspection) {
        const error = new Error("Inspection not found");
        error.statusCode = 404;
        error.code = "INSPECTION_NOT_FOUND";
        throw error;
      }
    }

    const log = await prisma.maintenanceLog.create({
      data: {
        extinguisherId: req.body.extinguisherId,
        inspectionId: req.body.inspectionId || null,
        inspectorId: currentUserId(req),
        actionTaken: req.body.actionTaken,
        maintenanceDate: toDate(req.body.maintenanceDate),
        issuesIdentified: req.body.issuesIdentified || null,
        notes: req.body.notes || null,
        recommendations: req.body.recommendations || null,
      },
    });

    await createNotification({
      req,
      userId: currentUserId(req),
      type: "MAINTENANCE_LOGGED",
      title: "Maintenance logged",
      message: `Maintenance logged for extinguisher ${log.extinguisherId}`,
      metadata: { maintenanceLogId: log.id, extinguisherId: log.extinguisherId },
    });

    await writeAuditLog({
      req,
      action: "MAINTENANCE_LOGGED",
      resourceType: "MAINTENANCE_LOG",
      resourceId: log.id,
      outcome: "SUCCESS",
      metadata: { extinguisherId: log.extinguisherId },
    });

    res.status(201).json({ success: true, data: toApi(await withInspectorName(req, log)) });
  } catch (error) {
    next(error);
  }
};

export const listMaintenance = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const where = {};

    if (req.query.extinguisherId) where.extinguisherId = req.query.extinguisherId;
    if (req.query.inspectionId) where.inspectionId = req.query.inspectionId;
    if (req.query.inspectorId) where.inspectorId = req.query.inspectorId;
    if (req.query.fromDate || req.query.toDate) {
      where.maintenanceDate = {};
      if (req.query.fromDate) where.maintenanceDate.gte = new Date(req.query.fromDate);
      if (req.query.toDate) where.maintenanceDate.lte = new Date(req.query.toDate);
    }

    const [items, total] = await Promise.all([
      prisma.maintenanceLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { maintenanceDate: "desc" },
      }),
      prisma.maintenanceLog.count({ where }),
    ]);

    const enrichedItems = await withInspectorNames(req, items);
    res.json({ success: true, data: enrichedItems.map(toApi), meta: { page, limit, total } });
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceById = async (req, res, next) => {
  try {
    const log = await findMaintenanceOrThrow(req.params.id);
    res.json({ success: true, data: toApi(await withInspectorName(req, log)) });
  } catch (error) {
    next(error);
  }
};
