import express from "express";
import healthRoutes from "./health.routes.js";
import notificationRoutes from "./notification.routes.js";

const router = express.Router();

router.use(healthRoutes);
router.use("/notifications", notificationRoutes);

export default router;
