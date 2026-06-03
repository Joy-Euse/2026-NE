import { env } from "../config/env.js";

export const createUserProfile = async ({ req, authUserId, firstName, lastName, email, role }) => {
  const response = await fetch(env.userServiceUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-request-id": req.requestId,
      "x-internal-service-token": env.internalServiceToken,
    },
    body: JSON.stringify({
      authUserId,
      firstName,
      lastName,
      email,
      role,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload?.error?.message || "Unable to create user profile");
    error.statusCode = response.status;
    error.code = payload?.error?.code || "USER_PROFILE_CREATE_FAILED";
    throw error;
  }

  return payload.data;
};

export const getUserProfileByAuthId = async ({ req, authUserId }) => {
  const response = await fetch(`${env.userServiceUrl}/auth/${authUserId}`, {
    headers: {
      "x-request-id": req.requestId,
      "x-internal-service-token": env.internalServiceToken,
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload?.error?.message || "Unable to fetch user profile");
    error.statusCode = response.status;
    error.code = payload?.error?.code || "USER_PROFILE_FETCH_FAILED";
    throw error;
  }

  return payload.data;
};
