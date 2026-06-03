export const notFound = (req, res, next) => {
  const error = new Error(`Gateway route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = "GATEWAY_ROUTE_NOT_FOUND";
  next(error);
};
