import dotenv from "dotenv";

dotenv.config({ override: true });

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4002),
  serviceName: process.env.SERVICE_NAME || "user-service",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "development_secret_change_me",
  auditLogServiceUrl: process.env.AUDIT_LOG_SERVICE_URL || "http://localhost:4007/api/audit-logs",
  internalServiceToken: process.env.INTERNAL_SERVICE_TOKEN || "development_internal_token",
};
