import express from "express";
import {
  createExport,
  downloadExport,
  getCompliance,
  getDashboard,
  getExportById,
  getInspections,
  getInventory,
  getMaintenance,
} from "../controllers/report.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, validateQuery } from "../middleware/validate.middleware.js";
import {
  complianceReportQuerySchema,
  exportReportSchema,
  inspectionReportQuerySchema,
  inventoryReportQuerySchema,
  maintenanceReportQuerySchema,
} from "../validations/report.validation.js";

const router = express.Router();

router.get("/dashboard", protect, authorize("ADMIN", "INSPECTOR", "USER"), getDashboard);
router.get("/inventory", protect, authorize("ADMIN", "INSPECTOR"), validateQuery(inventoryReportQuerySchema), getInventory);
router.get("/inspections", protect, authorize("ADMIN", "INSPECTOR"), validateQuery(inspectionReportQuerySchema), getInspections);
router.get("/compliance", protect, authorize("ADMIN", "INSPECTOR"), validateQuery(complianceReportQuerySchema), getCompliance);
router.get("/maintenance", protect, authorize("ADMIN", "INSPECTOR"), validateQuery(maintenanceReportQuerySchema), getMaintenance);
router.post("/exports", protect, authorize("ADMIN", "INSPECTOR"), validate(exportReportSchema), createExport);
router.get("/exports/:id/download", protect, authorize("ADMIN", "INSPECTOR"), downloadExport);
router.get("/exports/:id", protect, authorize("ADMIN", "INSPECTOR"), getExportById);

export default router;
