import Joi from "joi";

export const scheduleInspectionSchema = Joi.object({
  extinguisherId: Joi.string().uuid().required(),
  assignedInspectorId: Joi.string().uuid(),
  inspectionDate: Joi.date().iso().required(),
  inspectionTime: Joi.string().trim().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
});

export const updateInspectionSchema = Joi.object({
  extinguisherId: Joi.string().uuid(),
  assignedInspectorId: Joi.string().uuid().allow(null),
  inspectionDate: Joi.date().iso(),
  inspectionTime: Joi.string().trim().pattern(/^([01]\d|2[0-3]):[0-5]\d$/),
}).min(1);

export const completeInspectionSchema = Joi.object({
  result: Joi.string().valid("PASS", "FAIL", "NEEDS_MAINTENANCE", "NOT_APPLICABLE").required(),
  resultNotes: Joi.string().trim().max(2000).allow(null, ""),
});

export const cancelInspectionSchema = Joi.object({
  cancelReason: Joi.string().trim().max(500).allow(null, ""),
});
