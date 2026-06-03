import crypto from "crypto";

export const requestId = (req, res, next) => {
  const incomingId = req.get("x-request-id");
  req.requestId = incomingId || crypto.randomUUID();
  res.setHeader("x-request-id", req.requestId);
  next();
};
