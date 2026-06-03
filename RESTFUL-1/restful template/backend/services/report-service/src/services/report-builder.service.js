import { listExtinguishers } from "./extinguisher-service.client.js";
import { listInspections, listMaintenance } from "./inspection-service.client.js";

const countBy = (items, key) =>
  items.reduce((acc, item) => {
    const value = item[key] || "UNKNOWN";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

const upcomingDate = (days = 30) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const buildDashboardReport = async ({ req, limited = false }) => {
  const [extinguishers, scheduled, completed, overdue, maintenance] = await Promise.all([
    listExtinguishers({ req, filters: { limit: 100 } }),
    listInspections({ req, filters: { status: "SCHEDULED", limit: 100 } }),
    limited ? Promise.resolve([]) : listInspections({ req, filters: { status: "COMPLETED", limit: 100 } }),
    listInspections({ req, filters: { status: "OVERDUE", limit: 100 } }),
    limited ? Promise.resolve([]) : listMaintenance({ req, filters: { limit: 10 } }),
  ]);

  return {
    summary: {
      totalExtinguishers: extinguishers.length,
      activeExtinguishers: extinguishers.filter((item) => item.status === "ACTIVE").length,
      pendingInspections: scheduled.length,
      overdueInspections: overdue.length,
      completedInspections: completed.length,
      recentMaintenanceCount: maintenance.length,
    },
    limited,
    recentMaintenance: limited ? [] : maintenance.slice(0, 10),
  };
};

export const buildInventoryReport = async ({ req, filters }) => {
  const extinguishers = await listExtinguishers({ req, filters });
  return {
    summary: {
      total: extinguishers.length,
      byStatus: countBy(extinguishers, "status"),
      byType: countBy(extinguishers, "type"),
      byBuilding: countBy(extinguishers, "building"),
    },
    rows: extinguishers,
  };
};

export const buildInspectionReport = async ({ req, filters }) => {
  const inspections = await listInspections({ req, filters });
  return {
    summary: {
      total: inspections.length,
      pending: inspections.filter((item) => item.status === "SCHEDULED").length,
      completed: inspections.filter((item) => item.status === "COMPLETED").length,
      overdue: inspections.filter((item) => item.status === "OVERDUE").length,
      cancelled: inspections.filter((item) => item.status === "CANCELLED").length,
    },
    rows: inspections,
  };
};

export const buildComplianceReport = async ({ req, filters }) => {
  const [expired, upcoming, inventory] = await Promise.all([
    listExtinguishers({ req, filters: { ...filters, status: "EXPIRED", limit: 100 } }),
    listExtinguishers({ req, filters: { ...filters, expiryBefore: filters.expiryBefore || upcomingDate(30), limit: 100 } }),
    listExtinguishers({ req, filters: { ...filters, limit: 100 } }),
  ]);

  const nonCompliantStatuses = new Set(["EXPIRED", "RETIRED"]);
  const nonCompliant = inventory.filter((item) => nonCompliantStatuses.has(item.status));

  return {
    summary: {
      total: inventory.length,
      expired: expired.length,
      upcomingExpirations: upcoming.length,
      compliant: inventory.length - nonCompliant.length,
      nonCompliant: nonCompliant.length,
      complianceRate: inventory.length ? Number((((inventory.length - nonCompliant.length) / inventory.length) * 100).toFixed(2)) : 100,
    },
    expired,
    upcomingExpirations: upcoming,
  };
};

export const buildMaintenanceReport = async ({ req, filters }) => {
  const maintenance = await listMaintenance({ req, filters });
  return {
    summary: {
      total: maintenance.length,
      frequencyByInspector: countBy(maintenance, "inspectorId"),
      frequencyByExtinguisher: countBy(maintenance, "extinguisherId"),
    },
    recent: maintenance.slice(0, 10),
    rows: maintenance,
  };
};

export const buildReportByType = async ({ req, reportType, filters = {}, limited = false }) => {
  switch (reportType) {
    case "DASHBOARD":
      return buildDashboardReport({ req, limited });
    case "INVENTORY":
      return buildInventoryReport({ req, filters });
    case "INSPECTIONS":
      return buildInspectionReport({ req, filters });
    case "COMPLIANCE":
      return buildComplianceReport({ req, filters });
    case "MAINTENANCE":
      return buildMaintenanceReport({ req, filters });
    default: {
      const error = new Error("Unsupported report type");
      error.statusCode = 400;
      error.code = "UNSUPPORTED_REPORT_TYPE";
      throw error;
    }
  }
};
