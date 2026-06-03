export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

  if (error) {
    error.statusCode = 400;
    error.code = "VALIDATION_ERROR";
    error.details = error.details.map((detail) => detail.message);
    return next(error);
  }

  req.body = value;
  return next();
};

export const validateQuery = (schema) => (req, res, next) => {
  const query = Object.fromEntries(
    Object.entries(req.query).filter(([, value]) => value !== ""),
  );
  const { error, value } = schema.validate(query, { abortEarly: false, stripUnknown: true });

  if (error) {
    error.statusCode = 400;
    error.code = "VALIDATION_ERROR";
    error.details = error.details.map((detail) => detail.message);
    return next(error);
  }

  req.validatedQuery = value;
  return next();
};
