import express from "express";
import auditlogRoutes from "./auditlog.routes.js";

const router = express.Router();

router.use("/audit-logs", auditlogRoutes);

export default router;
