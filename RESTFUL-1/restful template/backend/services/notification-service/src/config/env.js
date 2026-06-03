import dotenv from "dotenv";

dotenv.config({ override: true });

export const env = {
  port: Number(process.env.PORT || 4005),
  serviceName: process.env.SERVICE_NAME || "notification-service",
};
