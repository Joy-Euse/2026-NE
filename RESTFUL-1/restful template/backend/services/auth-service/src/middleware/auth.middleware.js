import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../utils/jwt.js";

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
    req.user = verifyAccessToken(token);
    return next();
  } catch (error) {
    error.statusCode = 401;
    error.code = "INVALID_TOKEN";
    error.message = "Invalid or expired token";
    return next(error);
  }
};
