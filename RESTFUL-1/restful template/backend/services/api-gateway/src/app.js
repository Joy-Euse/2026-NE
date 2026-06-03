import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: "api-gateway",
      timestamp: new Date().toISOString(),
    },
  });
});

app.use("/api/auth", createProxyMiddleware({ target: process.env.AUTH_SERVICE_URL, changeOrigin: true }));
app.use("/api/users", createProxyMiddleware({ target: process.env.USER_SERVICE_URL, changeOrigin: true }));
app.use("/api/extinguishers", createProxyMiddleware({ target: process.env.EXTINGUISHER_SERVICE_URL, changeOrigin: true }));
app.use("/api/inspections", createProxyMiddleware({ target: process.env.INSPECTION_SERVICE_URL, changeOrigin: true }));
app.use("/api/maintenance", createProxyMiddleware({ target: process.env.INSPECTION_SERVICE_URL, changeOrigin: true }));
app.use("/api/notifications", createProxyMiddleware({ target: process.env.NOTIFICATION_SERVICE_URL, changeOrigin: true }));
app.use("/api/reports", createProxyMiddleware({ target: process.env.REPORT_SERVICE_URL, changeOrigin: true }));
app.use("/api/audit-logs", createProxyMiddleware({ target: process.env.AUDIT_LOG_SERVICE_URL, changeOrigin: true }));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
