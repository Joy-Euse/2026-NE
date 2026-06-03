import Joi from "joi";

const type = Joi.string().valid("WATER", "CO2", "FOAM", "DRY_CHEMICAL");
const size = Joi.string().valid("1.5 lb", "5 lb", "9 lb", "12 lb");
const status = Joi.string().valid("ACTIVE", "DUE_FOR_INSPECTION", "UNDER_MAINTENANCE", "EXPIRED", "RETIRED");

const dateRange = (value, helpers) => {
  if (value.installationDate && value.expiryDate) {
    const installationDate = new Date(value.installationDate);
    const expiryDate = new Date(value.expiryDate);

    if (expiryDate <= installationDate) {
      return helpers.error("any.invalid", {
        message: "expiryDate must be after installationDate",
      });
    }
  }

  return value;
};

export const createExtinguisherSchema = Joi.object({
  serialNumber: Joi.string().trim().min(1).max(80).required(),
  location: Joi.string().trim().min(1).max(200).required(),
  building: Joi.string().trim().min(1).max(120).required(),
  floor: Joi.string().trim().max(80).allow(null, ""),
  zone: Joi.string().trim().max(80).allow(null, ""),
  type: type.required(),
  size: size.required(),
  installationDate: Joi.date().iso().required(),
  expiryDate: Joi.date().iso().required(),
  status: status.default("ACTIVE"),
}).custom(dateRange, "date range validation");

export const updateExtinguisherSchema = Joi.object({
  serialNumber: Joi.string().trim().min(1).max(80),
  location: Joi.string().trim().min(1).max(200),
  building: Joi.string().trim().min(1).max(120),
  floor: Joi.string().trim().max(80).allow(null, ""),
  zone: Joi.string().trim().max(80).allow(null, ""),
  type,
  size,
  installationDate: Joi.date().iso(),
  expiryDate: Joi.date().iso(),
  status,
}).min(1).custom(dateRange, "date range validation");

export const updateStatusSchema = Joi.object({
  status: status.required(),
  reason: Joi.string().trim().max(500).allow(null, ""),
});

export const listExtinguishersSchema = Joi.object({
  status,
  type,
  building: Joi.string().trim().max(120),
  floor: Joi.string().trim().max(80),
  zone: Joi.string().trim().max(80),
  expiryBefore: Joi.date().iso(),
  search: Joi.string().trim().max(120),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
}).unknown(false);
