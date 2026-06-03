import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
  override: true,
});

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4006),
  serviceName: process.env.SERVICE_NAME || "report-service",
  jwtSecret: process.env.JWT_SECRET || "development_secret_change_me",
  extinguisherServiceUrl: process.env.EXTINGUISHER_SERVICE_URL || "http://localhost:4003/api/extinguishers",
  inspectionServiceUrl: process.env.INSPECTION_SERVICE_URL || "http://localhost:4004/api/inspections",
  maintenanceServiceUrl: process.env.MAINTENANCE_SERVICE_URL || "http://localhost:4004/api/maintenance",
  auditLogServiceUrl: process.env.AUDIT_LOG_SERVICE_URL || "http://localhost:4007/api/audit-logs",
  exportDir: process.env.EXPORT_DIR || "exports",
};
