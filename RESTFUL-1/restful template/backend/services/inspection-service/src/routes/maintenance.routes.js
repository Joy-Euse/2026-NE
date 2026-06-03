import express from "express";
import {
  createMaintenance,
  getMaintenanceById,
  listMaintenance,
} from "../controllers/maintenance.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createMaintenanceSchema } from "../validations/maintenance.validation.js";

const router = express.Router();

router.post("/", protect, authorize("INSPECTOR"), validate(createMaintenanceSchema), createMaintenance);
router.get("/", protect, authorize("ADMIN", "INSPECTOR", "USER"), listMaintenance);
router.get("/:id", protect, authorize("ADMIN", "INSPECTOR", "USER"), getMaintenanceById);

export default router;
