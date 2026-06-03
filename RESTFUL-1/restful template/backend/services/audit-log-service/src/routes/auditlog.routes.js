import express from "express";
import {
  createAuditLog,
  getAuditLogById,
  getAuditLogs,
  getAuditLogsByUser,
} from "../controllers/auditlog.controller.js";

const router = express.Router();

router.post("/", createAuditLog);
router.get("/", getAuditLogs);
router.get("/user/:user_id", getAuditLogsByUser);
router.get("/:id", getAuditLogById);

export default router;
