import Joi from "joi";

const filters = Joi.object({
  fromDate: Joi.date().iso(),
  toDate: Joi.date().iso(),
  status: Joi.string(),
  type: Joi.string(),
  building: Joi.string(),
  inspector: Joi.string().uuid(),
  assignedInspectorId: Joi.string().uuid(),
  expiryBefore: Joi.date().iso(),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
}).unknown(false).default({});

export const exportReportSchema = Joi.object({
  reportType: Joi.string().valid("DASHBOARD", "INVENTORY", "INSPECTIONS", "COMPLIANCE", "MAINTENANCE").required(),
  format: Joi.string().valid("PDF", "CSV").required(),
  filters,
});
