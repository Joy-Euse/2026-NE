import Joi from "joi";

const password = Joi.string().min(8).max(128).required();

export const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(80).required(),
  lastName: Joi.string().trim().min(1).max(80).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password,
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const logoutSchema = refreshSchema;

export const validateTokenSchema = Joi.object({
  token: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: password,
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

export const verifyResetCodeSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  code: Joi.string().pattern(/^\d{5}$/).required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  code: Joi.string().pattern(/^\d{5}$/).required(),
  newPassword: password,
});
