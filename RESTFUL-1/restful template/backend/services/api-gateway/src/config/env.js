import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
  override: true,
});

export const env = {
  port: Number(process.env.PORT || 4000),
  serviceName: process.env.SERVICE_NAME || "api-gateway",
  authServiceUrl: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
  userServiceUrl: process.env.USER_SERVICE_URL || "http://localhost:4002",
  extinguisherServiceUrl: process.env.EXTINGUISHER_SERVICE_URL || "http://localhost:4003",
  inspectionServiceUrl: process.env.INSPECTION_SERVICE_URL || "http://localhost:4004",
  notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:4005",
  reportServiceUrl: process.env.REPORT_SERVICE_URL || "http://localhost:4006",
  auditLogServiceUrl: process.env.AUDIT_LOG_SERVICE_URL || "http://localhost:4007",
};
