import express from "express";
import { createInternalUser, getInternalUserByAuthId, getInternalUserById } from "../controllers/user.controller.js";
import { internalOnly } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createInternalUserSchema } from "../validations/user.validation.js";

const router = express.Router();

router.post("/users", internalOnly, validate(createInternalUserSchema), createInternalUser);
router.get("/users/auth/:authUserId", internalOnly, getInternalUserByAuthId);
router.get("/users/:id", internalOnly, getInternalUserById);

export default router;
