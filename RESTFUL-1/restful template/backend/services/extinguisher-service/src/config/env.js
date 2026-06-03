import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4003),
  serviceName: process.env.SERVICE_NAME || "extinguisher-service",
  jwtSecret: process.env.JWT_SECRET || "development_secret_change_me",
  auditLogServiceUrl: process.env.AUDIT_LOG_SERVICE_URL || "http://localhost:4007/api/audit-logs",
};
