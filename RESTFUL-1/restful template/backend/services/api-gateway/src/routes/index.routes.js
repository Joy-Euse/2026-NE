import express from "express";
import gatewayRoutes from "./gateway.routes.js";
import proxyRoutes from "./proxy.routes.js";

const router = express.Router();

router.use(gatewayRoutes);
router.use(proxyRoutes);

export default router;
