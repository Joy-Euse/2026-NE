import { env } from "../config/env.js";

const publicAuthPaths = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/signup",
  "/api/auth/refresh",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/health",
]);

const isPublicRoute = (req) =>
  req.path === "/health" ||
  req.path === "/api" ||
  publicAuthPaths.has(req.path);

export const validateAccessToken = async (req, res, next) => {
  if (isPublicRoute(req)) return next();

  const header = req.get("authorization") || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    const error = new Error("Authentication token is required");
    error.statusCode = 401;
    error.code = "UNAUTHORIZED";
    return next(error);
  }

  try {
    const response = await fetch(`${env.authServiceUrl}/api/auth/validate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-request-id": req.requestId,
      },
      body: JSON.stringify({ token }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload.data?.valid) {
      const error = new Error(payload?.error?.message || "Invalid token");
      error.statusCode = response.status || 401;
      error.code = payload?.error?.code || "INVALID_TOKEN";
      return next(error);
    }

    req.user = payload.data.user;
    req.tokenClaims = payload.data.claims;
    return next();
  } catch (error) {
    error.statusCode = 503;
    error.code = "AUTH_SERVICE_UNAVAILABLE";
    error.message = "Unable to validate token with Authentication Service";
    return next(error);
  }
};
