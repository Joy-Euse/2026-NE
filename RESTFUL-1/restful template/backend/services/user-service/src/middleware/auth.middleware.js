import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const protect = (req, res, next) => {
  const header = req.get("authorization") || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    const error = new Error("Authentication token is required");
    error.statusCode = 401;
    error.code = "UNAUTHORIZED";
    return next(error);
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (error) {
    error.statusCode = 401;
    error.code = "INVALID_TOKEN";
    error.message = "Invalid or expired token";
    return next(error);
  }
};

export const internalOnly = (req, res, next) => {
  const token = req.get("x-internal-service-token");

  if (env.internalServiceToken !== "development_internal_token" && token !== env.internalServiceToken) {
    const error = new Error("Internal service token is invalid");
    error.statusCode = 403;
    error.code = "FORBIDDEN";
    return next(error);
  }

  return next();
};
