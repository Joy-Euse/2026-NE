import Joi from "joi";

export const createNotificationSchema = Joi.object({
  userId: Joi.string().required(),
  type: Joi.string().trim().min(1).max(80).required(),
  title: Joi.string().trim().min(1).max(160).required(),
  message: Joi.string().trim().min(1).max(1000).required(),
  channel: Joi.string().valid("IN_APP", "EMAIL", "SMS").default("IN_APP"),
  metadata: Joi.object().unknown(true).default({}),
});
