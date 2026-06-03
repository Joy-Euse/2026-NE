import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
  override: true,
});

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4003),
  serviceName: process.env.SERVICE_NAME || "extinguisher-service",
  jwtSecret: process.env.JWT_SECRET || "development_secret_change_me",
  auditLogServiceUrl: process.env.AUDIT_LOG_SERVICE_URL || "http://localhost:4007/api/audit-logs",
  notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:4005/api/notifications",
  internalServiceToken: process.env.INTERNAL_SERVICE_TOKEN || "development_internal_token",
};
