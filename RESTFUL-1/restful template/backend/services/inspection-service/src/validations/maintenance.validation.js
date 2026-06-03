import Joi from "joi";

export const createMaintenanceSchema = Joi.object({
  extinguisherId: Joi.string().uuid().required(),
  inspectionId: Joi.string().uuid(),
  actionTaken: Joi.string().trim().min(1).max(500).required(),
  maintenanceDate: Joi.date().iso().required(),
  issuesIdentified: Joi.string().trim().max(2000).allow(null, ""),
  notes: Joi.string().trim().max(2000).allow(null, ""),
  recommendations: Joi.string().trim().max(2000).allow(null, ""),
});
