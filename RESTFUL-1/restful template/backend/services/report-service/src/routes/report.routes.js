import express from "express";
import {
  createExport,
  getCompliance,
  getDashboard,
  getExportById,
  getInspections,
  getInventory,
  getMaintenance,
} from "../controllers/report.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { exportReportSchema } from "../validations/report.validation.js";

const router = express.Router();

router.get("/dashboard", protect, authorize("ADMIN", "INSPECTOR", "USER"), getDashboard);
router.get("/inventory", protect, authorize("ADMIN", "INSPECTOR"), getInventory);
router.get("/inspections", protect, authorize("ADMIN", "INSPECTOR"), getInspections);
router.get("/compliance", protect, authorize("ADMIN", "INSPECTOR"), getCompliance);
router.get("/maintenance", protect, authorize("ADMIN", "INSPECTOR"), getMaintenance);
router.post("/exports", protect, authorize("ADMIN", "INSPECTOR"), validate(exportReportSchema), createExport);
router.get("/exports/:id", protect, authorize("ADMIN", "INSPECTOR"), getExportById);

export default router;
