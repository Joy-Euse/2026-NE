import { create, findAll, findById, findByUserId } from "../models/auditlog.model.js";

export const createAuditLog = async (req, res, next) => {
  try {
    const log = await create({
      userId: req.body.userId || req.body.user_id || req.body.actorUserId || req.body.actor_user_id || null,
      action: req.body.action,
      resource: req.body.resource || req.body.resourceType || req.body.resource_type || "UNKNOWN",
      resourceId: req.body.resourceId || req.body.resource_id || null,
      description: req.body.description || "",
      status: req.body.status || req.body.outcome || "SUCCESS",
      metadata: req.body.metadata || {},
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    res.json({ success: true, data: await findAll() });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogById = async (req, res, next) => {
  try {
    const log = await findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Audit log not found" } });
    }
    res.json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogsByUser = async (req, res, next) => {
  try {
    res.json({ success: true, data: await findByUserId(req.params.user_id) });
  } catch (error) {
    next(error);
  }
};
