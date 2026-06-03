import express from "express";
import { createNotification, listNotifications } from "../controllers/notification.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createNotificationSchema } from "../validations/notification.validation.js";

const router = express.Router();

router.post("/", validate(createNotificationSchema), createNotification);
router.get("/", listNotifications);

export default router;
