import { env } from "./env.js";

export const services = [
  { key: "auth", name: "Authentication Service", path: "/api/auth", target: env.authServiceUrl },
  { key: "users", name: "User Management Service", path: "/api/users", target: env.userServiceUrl },
  { key: "extinguishers", name: "Fire Extinguisher Service", path: "/api/extinguishers", target: env.extinguisherServiceUrl },
  { key: "inspections", name: "Inspection Service", path: "/api/inspections", target: env.inspectionServiceUrl },
  { key: "maintenance", name: "Maintenance API", path: "/api/maintenance", target: env.inspectionServiceUrl },
  { key: "notifications", name: "Notification Service", path: "/api/notifications", target: env.notificationServiceUrl },
  { key: "reports", name: "Reporting Service", path: "/api/reports", target: env.reportServiceUrl },
  { key: "auditLogs", name: "Audit Log Service", path: "/api/audit-logs", target: env.auditLogServiceUrl },
];
