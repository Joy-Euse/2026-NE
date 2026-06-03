import Joi from "joi";

export const createInternalUserSchema = Joi.object({
  authUserId: Joi.string().uuid().required(),
  firstName: Joi.string().trim().min(1).max(80).required(),
  lastName: Joi.string().trim().min(1).max(80).required(),
  email: Joi.string().trim().lowercase().email().required(),
  role: Joi.string().valid("ADMIN", "INSPECTOR", "USER").default("USER"),
});

export const updateOwnProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(80),
  lastName: Joi.string().trim().min(1).max(80),
  phone: Joi.string().trim().max(30).allow(null, ""),
}).min(1);

export const adminUpdateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(80),
  lastName: Joi.string().trim().min(1).max(80),
  phone: Joi.string().trim().max(30).allow(null, ""),
  status: Joi.string().valid("ACTIVE", "INACTIVE", "DEACTIVATED"),
}).min(1);

export const changeRoleSchema = Joi.object({
  role: Joi.string().valid("ADMIN", "INSPECTOR", "USER").required(),
});

export const changeStatusSchema = Joi.object({
  status: Joi.string().valid("ACTIVE", "INACTIVE", "DEACTIVATED").required(),
});
