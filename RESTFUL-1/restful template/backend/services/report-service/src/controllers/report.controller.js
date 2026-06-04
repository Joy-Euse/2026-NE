import { prisma } from "../config/prisma.js";
import { writeAuditLog } from "../services/audit.service.js";
import {
  buildComplianceReport,
  buildDashboardReport,
  buildInspectionReport,
  buildInventoryReport,
  buildMaintenanceReport,
  buildReportByType,
} from "../services/report-builder.service.js";
import { writeCsvExport, writePdfExport } from "../services/export.service.js";
import { access } from "fs/promises";

const filtersFromQuery = (query) => ({
  fromDate: query.fromDate,
  toDate: query.toDate,
  status: query.status,
  type: query.type,
  building: query.building,
  inspector: query.inspector,
  assignedInspectorId: query.assignedInspectorId,
  expiryBefore: query.expiryBefore,
  page: query.page,
  limit: query.limit,
});

const toJsonSafeFilters = (filters = {}) =>
  Object.fromEntries(
    Object.entries(filters).map(([key, value]) => [
      key,
      value instanceof Date ? value.toISOString().slice(0, 10) : value,
    ]),
  );

const auditView = (req, reportType, metadata) =>
  writeAuditLog({
    req,
    action: "REPORT_VIEWED",
    resourceType: "REPORT",
    outcome: "SUCCESS",
    metadata: { reportType, ...metadata },
  });

export const getDashboard = async (req, res, next) => {
  try {
    const report = await buildDashboardReport({ req, limited: req.user.role === "USER" });
    await auditView(req, "DASHBOARD");
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

export const getInventory = async (req, res, next) => {
  try {
    const filters = filtersFromQuery(req.validatedQuery || req.query);
    const report = await buildInventoryReport({ req, filters });
    await auditView(req, "INVENTORY", { filters });
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

export const getInspections = async (req, res, next) => {
  try {
    const filters = filtersFromQuery(req.validatedQuery || req.query);
    const report = await buildInspectionReport({ req, filters });
    await auditView(req, "INSPECTIONS", { filters });
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

export const getCompliance = async (req, res, next) => {
  try {
    const filters = filtersFromQuery(req.validatedQuery || req.query);
    const report = await buildComplianceReport({ req, filters });
    await auditView(req, "COMPLIANCE", { filters });
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

export const getMaintenance = async (req, res, next) => {
  try {
    const filters = filtersFromQuery(req.validatedQuery || req.query);
    const report = await buildMaintenanceReport({ req, filters });
    await auditView(req, "MAINTENANCE", { filters });
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

export const createExport = async (req, res, next) => {
  let exportRecord;

  try {
    const { reportType, format } = req.body;
    const filters = toJsonSafeFilters(req.body.filters);

    exportRecord = await prisma.reportExport.create({
      data: {
        requestedByUserId: req.user.profileId || req.user.sub,
        reportType,
        format,
        filters,
        status: "COMPLETED",
      },
    });

    const report = await buildReportByType({ req, reportType, filters });
    const file = format === "CSV"
      ? writeCsvExport({ exportId: exportRecord.id, reportType, report })
      : await writePdfExport({ exportId: exportRecord.id, reportType, report, filters });

    exportRecord = await prisma.reportExport.update({
      where: { id: exportRecord.id },
      data: {
        fileName: file.fileName,
        filePath: file.filePath,
        completedAt: new Date(),
      },
    });

    await writeAuditLog({
      req,
      action: "REPORT_EXPORTED",
      resourceType: "REPORT_EXPORT",
      resourceId: exportRecord.id,
      outcome: "SUCCESS",
      metadata: { reportType, format, filters },
    });

    res.status(201).json({ success: true, data: exportRecord });
  } catch (error) {
    if (exportRecord?.id) {
      await prisma.reportExport.update({
        where: { id: exportRecord.id },
        data: { status: "FAILED", errorMessage: error.message },
      }).catch(() => {});
    }
    next(error);
  }
};

export const getExportById = async (req, res, next) => {
  try {
    const exportRecord = await prisma.reportExport.findUnique({ where: { id: req.params.id } });

    if (!exportRecord) {
      const error = new Error("Report export not found");
      error.statusCode = 404;
      error.code = "REPORT_EXPORT_NOT_FOUND";
      throw error;
    }

    res.json({ success: true, data: exportRecord });
  } catch (error) {
    next(error);
  }
};

export const downloadExport = async (req, res, next) => {
  try {
    const exportRecord = await prisma.reportExport.findUnique({ where: { id: req.params.id } });

    if (!exportRecord) {
      const error = new Error("Report export not found");
      error.statusCode = 404;
      error.code = "REPORT_EXPORT_NOT_FOUND";
      throw error;
    }

    if (exportRecord.status !== "COMPLETED" || !exportRecord.filePath || !exportRecord.fileName) {
      const error = new Error("Report export file is not ready");
      error.statusCode = 409;
      error.code = "REPORT_EXPORT_NOT_READY";
      throw error;
    }

    await access(exportRecord.filePath);

    await writeAuditLog({
      req,
      action: "REPORT_EXPORT_DOWNLOADED",
      resourceType: "REPORT_EXPORT",
      resourceId: exportRecord.id,
      outcome: "SUCCESS",
      metadata: { reportType: exportRecord.reportType, format: exportRecord.format },
    });

    res.download(exportRecord.filePath, exportRecord.fileName);
  } catch (error) {
    next(error);
  }
};
