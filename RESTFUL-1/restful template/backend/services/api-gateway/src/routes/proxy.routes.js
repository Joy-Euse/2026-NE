import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { services } from "../config/services.js";

const router = express.Router();

const createServiceProxy = (service) =>
  createProxyMiddleware({
    target: service.target,
    changeOrigin: true,
    proxyTimeout: 30000,
    timeout: 30000,
    onProxyReq: (proxyReq, req) => {
      proxyReq.setHeader("x-request-id", req.requestId);
      if (req.user?.role) proxyReq.setHeader("x-user-role", req.user.role);
    },
    onError: (err, req, res) => {
      res.status(503).json({
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: `${service.name} is unavailable`,
        },
        requestId: req.requestId,
      });
    },
  });

services.forEach((service) => {
  router.use(service.path, createServiceProxy(service));
});

export default router;
