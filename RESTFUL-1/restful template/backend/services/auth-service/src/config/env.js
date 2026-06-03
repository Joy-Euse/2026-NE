import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4001),
  serviceName: process.env.SERVICE_NAME || "auth-service",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "development_secret_change_me",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  refreshTokenDays: Number(process.env.REFRESH_TOKEN_DAYS || 7),
  passwordResetMinutes: Number(process.env.PASSWORD_RESET_MINUTES || 15),
  userServiceUrl: process.env.USER_SERVICE_URL || "http://localhost:4002/api/internal/users",
  auditLogServiceUrl: process.env.AUDIT_LOG_SERVICE_URL || "http://localhost:4007/api/audit-logs",
  internalServiceToken: process.env.INTERNAL_SERVICE_TOKEN || "development_internal_token",
};
