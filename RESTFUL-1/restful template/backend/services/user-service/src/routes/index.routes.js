import express from "express";
import healthRoutes from "./health.routes.js";
import internalRoutes from "./internal.routes.js";
import userRoutes from "./user.routes.js";

const router = express.Router();

router.use(healthRoutes);
router.use("/internal", internalRoutes);
router.use("/users", userRoutes);

export default router;
