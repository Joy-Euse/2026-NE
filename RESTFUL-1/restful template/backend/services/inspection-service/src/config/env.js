import dotenv from "dotenv";

dotenv.config({ override: true });

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4004),
  serviceName: process.env.SERVICE_NAME || "inspection-service",
  jwtSecret: process.env.JWT_SECRET || "development_secret_change_me",
  extinguisherServiceUrl: process.env.EXTINGUISHER_SERVICE_URL || "http://localhost:4003/api/extinguishers",
  userServiceUrl: process.env.USER_SERVICE_URL || "http://localhost:4002/api/internal/users",
  notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:4005/api/notifications",
  auditLogServiceUrl: process.env.AUDIT_LOG_SERVICE_URL || "http://localhost:4007/api/audit-logs",
  internalServiceToken: process.env.INTERNAL_SERVICE_TOKEN || "development_internal_token",
};
