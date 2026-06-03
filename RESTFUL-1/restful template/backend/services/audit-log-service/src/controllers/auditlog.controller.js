import { create, findAll, findById, findByUserId } from "../models/auditlog.model.js";

export const createAuditLog = async (req, res, next) => {
  try {
    const log = await create({
      user_id: req.body.user_id || req.body.actor_user_id || null,
      action: req.body.action,
      resource: req.body.resource || req.body.resource_type,
      description: req.body.description || JSON.stringify(req.body.metadata || {}),
      status: req.body.status || req.body.outcome,
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
