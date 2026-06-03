import express from "express";
import {
  createExtinguisher,
  getExtinguisherById,
  listExtinguishers,
  retireExtinguisher,
  updateExtinguisher,
  updateExtinguisherStatus,
} from "../controllers/extinguisher.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createExtinguisherSchema,
  updateExtinguisherSchema,
  updateStatusSchema,
} from "../validations/extinguisher.validation.js";

const router = express.Router();

router.post("/", protect, authorize("ADMIN"), validate(createExtinguisherSchema), createExtinguisher);
router.get("/", protect, authorize("ADMIN", "INSPECTOR", "USER"), listExtinguishers);
router.get("/:id", protect, authorize("ADMIN", "INSPECTOR", "USER"), getExtinguisherById);
router.put("/:id", protect, authorize("ADMIN", "INSPECTOR"), validate(updateExtinguisherSchema), updateExtinguisher);
router.patch("/:id/status", protect, authorize("ADMIN", "INSPECTOR"), validate(updateStatusSchema), updateExtinguisherStatus);
router.delete("/:id", protect, authorize("ADMIN"), retireExtinguisher);

export default router;
