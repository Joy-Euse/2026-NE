import { env } from "../config/env.js";
import { services } from "../config/services.js";

export const getRoot = (req, res) => {
  res.json({
    success: true,
    data: {
      service: env.serviceName,
      message: "API Gateway is running",
      health: "/health",
      apiIndex: "/api",
    },
  });
};

export const getHealth = (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: env.serviceName,
      timestamp: new Date().toISOString(),
    },
  });
};

export const getApiIndex = (req, res) => {
  res.json({
    success: true,
    data: {
      gateway: env.serviceName,
      routes: services.map(({ name, path, target }) => ({ name, path, target })),
    },
  });
};
