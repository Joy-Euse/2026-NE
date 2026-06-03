import express from "express";
import {
  createExtinguisher,
  getExtinguisherById,
  listExtinguishers,
  retireExtinguisher,
  updateExtinguisher,
  updateExtinguisherStatus,
} from "../controllers/extinguisher.controller.js";
import {
  assignExtinguisher,
  listMyExtinguishers,
  removeAssignment,
} from "../controllers/assignment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate, validateQuery } from "../middleware/validate.middleware.js";
import {
  createExtinguisherSchema,
  listExtinguishersSchema,
  updateExtinguisherSchema,
  updateStatusSchema,
} from "../validations/extinguisher.validation.js";
import { assignExtinguisherSchema } from "../validations/assignment.validation.js";

const router = express.Router();

// ── Assignment routes (registered before /:id to avoid param collision) ─────
router.get("/my", protect, authorize("USER"), listMyExtinguishers);
router.post("/:id/assign", protect, authorize("ADMIN"), validate(assignExtinguisherSchema), assignExtinguisher);
router.delete("/:id/assignment", protect, authorize("ADMIN"), removeAssignment);

// ── Core CRUD ────────────────────────────────────────────────────────────────
router.post("/", protect, authorize("ADMIN"), validate(createExtinguisherSchema), createExtinguisher);
router.get("/", protect, authorize("ADMIN", "INSPECTOR", "USER"), validateQuery(listExtinguishersSchema), listExtinguishers);
router.get("/:id", protect, authorize("ADMIN", "INSPECTOR", "USER"), getExtinguisherById);
router.put("/:id", protect, authorize("ADMIN", "INSPECTOR"), validate(updateExtinguisherSchema), updateExtinguisher);
router.patch("/:id/status", protect, authorize("ADMIN", "INSPECTOR"), validate(updateStatusSchema), updateExtinguisherStatus);
router.delete("/:id", protect, authorize("ADMIN"), retireExtinguisher);

export default router;
