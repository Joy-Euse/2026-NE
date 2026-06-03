import express from "express";
import healthRoutes from "./health.routes.js";
import inspectionRoutes from "./inspection.routes.js";
import maintenanceRoutes from "./maintenance.routes.js";

const router = express.Router();

router.use(healthRoutes);
router.use("/inspections", inspectionRoutes);
router.use("/maintenance", maintenanceRoutes);

export default router;
