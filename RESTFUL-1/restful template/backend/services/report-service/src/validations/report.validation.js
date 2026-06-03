import Joi from "joi";

const extinguisherStatus = Joi.string().valid("ACTIVE", "DUE_FOR_INSPECTION", "UNDER_MAINTENANCE", "EXPIRED", "RETIRED");
const inspectionStatus = Joi.string().valid("SCHEDULED", "COMPLETED", "CANCELLED", "OVERDUE");
const extinguisherType = Joi.string().valid("WATER", "CO2", "FOAM", "DRY_CHEMICAL");

const commonFilters = {
  fromDate: Joi.date().iso(),
  toDate: Joi.date().iso(),
  building: Joi.string(),
  inspector: Joi.string().uuid(),
  assignedInspectorId: Joi.string().uuid(),
  expiryBefore: Joi.date().iso(),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
};

export const inventoryReportQuerySchema = Joi.object({
  ...commonFilters,
  status: extinguisherStatus,
  type: extinguisherType,
}).unknown(false);

export const inspectionReportQuerySchema = Joi.object({
  ...commonFilters,
  status: inspectionStatus,
}).unknown(false);

export const complianceReportQuerySchema = Joi.object({
  ...commonFilters,
  status: extinguisherStatus,
  type: extinguisherType,
}).unknown(false);

export const maintenanceReportQuerySchema = Joi.object(commonFilters).unknown(false);

const exportFilters = Joi.object({
  ...commonFilters,
  status: Joi.string().valid(
    "ACTIVE",
    "DUE_FOR_INSPECTION",
    "UNDER_MAINTENANCE",
    "EXPIRED",
    "RETIRED",
    "SCHEDULED",
    "COMPLETED",
    "CANCELLED",
    "OVERDUE",
  ),
  type: extinguisherType,
}).unknown(false).default({});

export const exportReportSchema = Joi.object({
  reportType: Joi.string().valid("DASHBOARD", "INVENTORY", "INSPECTIONS", "COMPLIANCE", "MAINTENANCE").required(),
  format: Joi.string().valid("PDF", "CSV").required(),
  filters: exportFilters,
}).custom((value, helpers) => {
  const status = value.filters?.status;
  if (!status) return value;

  const extinguisherStatuses = ["ACTIVE", "DUE_FOR_INSPECTION", "UNDER_MAINTENANCE", "EXPIRED", "RETIRED"];
  const inspectionStatuses = ["SCHEDULED", "COMPLETED", "CANCELLED", "OVERDUE"];

  if (["INVENTORY", "COMPLIANCE"].includes(value.reportType) && !extinguisherStatuses.includes(status)) {
    return helpers.message("status is not valid for this report type");
  }

  if (value.reportType === "INSPECTIONS" && !inspectionStatuses.includes(status)) {
    return helpers.message("status is not valid for this report type");
  }

  if (value.reportType === "MAINTENANCE") {
    return helpers.message("status is not supported for maintenance reports");
  }

  return value;
});
