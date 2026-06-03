import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
  override: true,
});

export const env = {
  port: Number(process.env.PORT || 4005),
  serviceName: process.env.SERVICE_NAME || "notification-service",
};
