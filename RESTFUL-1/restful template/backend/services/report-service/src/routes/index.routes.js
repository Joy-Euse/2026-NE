import express from "express";
import healthRoutes from "./health.routes.js";
import reportRoutes from "./report.routes.js";

const router = express.Router();

router.use(healthRoutes);
router.use("/reports", reportRoutes);

export default router;
