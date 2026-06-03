import express from "express";
import {
  assignInspector,
  cancelInspection,
  completeInspection,
  getInspectionById,
  listInspections,
  scheduleInspection,
  updateInspection,
} from "../controllers/inspection.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  assignInspectorSchema,
  cancelInspectionSchema,
  completeInspectionSchema,
  scheduleInspectionSchema,
  updateInspectionSchema,
} from "../validations/inspection.validation.js";

const router = express.Router();

router.post("/", protect, authorize("ADMIN", "INSPECTOR", "USER"), validate(scheduleInspectionSchema), scheduleInspection);
router.get("/", protect, authorize("ADMIN", "INSPECTOR", "USER"), listInspections);
router.get("/:id", protect, authorize("ADMIN", "INSPECTOR", "USER"), getInspectionById);
router.put("/:id", protect, authorize("ADMIN", "INSPECTOR"), validate(updateInspectionSchema), updateInspection);
router.patch("/:id/assign-inspector", protect, authorize("ADMIN"), validate(assignInspectorSchema), assignInspector);
router.patch("/:id/complete", protect, authorize("ADMIN", "INSPECTOR"), validate(completeInspectionSchema), completeInspection);
router.patch("/:id/cancel", protect, authorize("ADMIN", "INSPECTOR"), validate(cancelInspectionSchema), cancelInspection);

export default router;
