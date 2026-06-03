import Joi from "joi";

export const assignExtinguisherSchema = Joi.object({
  assignedUserId: Joi.string().uuid().required(),
  notes: Joi.string().trim().max(500).allow(null, ""),
});
