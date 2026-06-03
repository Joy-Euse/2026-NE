import express from "express";
import {
  adminUpdateUser,
  changeUserRole,
  changeUserStatus,
  deactivateUser,
  getOwnProfile,
  getUserById,
  listUsers,
  updateOwnProfile,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  adminUpdateUserSchema,
  changeRoleSchema,
  changeStatusSchema,
  updateOwnProfileSchema,
} from "../validations/user.validation.js";

const router = express.Router();

router.get("/me", protect, getOwnProfile);
router.put("/me", protect, validate(updateOwnProfileSchema), updateOwnProfile);

router.get("/", protect, authorize("ADMIN"), listUsers);
router.get("/:id", protect, authorize("ADMIN"), getUserById);
router.put("/:id", protect, authorize("ADMIN"), validate(adminUpdateUserSchema), adminUpdateUser);
router.patch("/:id/role", protect, authorize("ADMIN"), validate(changeRoleSchema), changeUserRole);
router.patch("/:id/status", protect, authorize("ADMIN"), validate(changeStatusSchema), changeUserStatus);
router.delete("/:id", protect, authorize("ADMIN"), deactivateUser);

export default router;
