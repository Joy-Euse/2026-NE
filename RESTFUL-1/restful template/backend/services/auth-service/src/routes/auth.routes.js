import express from "express";
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  refresh,
  register,
  resetPassword,
  validateToken,
  verifyResetCode,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyResetCodeSchema,
  validateTokenSchema,
} from "../validations/auth.validation.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/signup", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", protect, validate(logoutSchema), logout);
router.post("/validate", validate(validateTokenSchema), validateToken);
router.post("/change-password", protect, validate(changePasswordSchema), changePassword);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/verify-reset-code", validate(verifyResetCodeSchema), verifyResetCode);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
