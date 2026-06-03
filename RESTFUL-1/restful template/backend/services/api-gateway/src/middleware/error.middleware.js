export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  if (statusCode >= 500) {
    console.error({ requestId: req.requestId, message: err.message });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "GATEWAY_ERROR",
      message: statusCode >= 500 ? "API Gateway error" : err.message,
    },
    requestId: req.requestId,
  });
};
