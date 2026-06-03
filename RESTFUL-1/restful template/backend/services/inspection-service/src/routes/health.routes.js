import express from "express";
import { env } from "../config/env.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: env.serviceName,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
