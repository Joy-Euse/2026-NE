import { env } from "../config/env.js";

export const getInternalUser = async ({ req, userId }) => {
  const response = await fetch(`${env.userServiceUrl}/${userId}`, {
    headers: {
      "x-request-id": req.requestId,
      "x-internal-service-token": env.internalServiceToken,
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload?.error?.message || "User not found");
    error.statusCode = response.status;
    error.code = payload?.error?.code || "USER_LOOKUP_FAILED";
    throw error;
  }

  return payload.data;
};

export const validateInspector = async ({ req, userId }) => {
  const user = await getInternalUser({ req, userId });

  if (user.role !== "INSPECTOR" || user.status !== "ACTIVE") {
    const error = new Error("Assigned user must be an active inspector");
    error.statusCode = 400;
    error.code = "INVALID_ASSIGNED_INSPECTOR";
    throw error;
  }

  return user;
};
