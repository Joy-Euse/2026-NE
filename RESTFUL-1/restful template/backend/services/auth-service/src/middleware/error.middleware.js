import { env } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  if (statusCode >= 500) {
    console.error({
      requestId: req.requestId,
      message: err.message,
      stack: env.nodeEnv === "production" ? undefined : err.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: statusCode >= 500 ? "Internal server error" : err.message,
      details: err.details || undefined,
    },
    requestId: req.requestId,
  });
};
