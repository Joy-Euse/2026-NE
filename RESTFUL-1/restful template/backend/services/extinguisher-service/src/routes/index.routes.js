import express from "express";
import extinguisherRoutes from "./extinguisher.routes.js";
import healthRoutes from "./health.routes.js";

const router = express.Router();

router.use(healthRoutes);
router.use("/extinguishers", extinguisherRoutes);

export default router;
