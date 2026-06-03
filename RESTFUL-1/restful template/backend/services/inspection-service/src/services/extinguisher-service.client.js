import { env } from "../config/env.js";

export const getExtinguisher = async ({ req, extinguisherId }) => {
  const response = await fetch(`${env.extinguisherServiceUrl}/${extinguisherId}`, {
    headers: {
      authorization: `Bearer ${req.accessToken}`,
      "x-request-id": req.requestId,
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload?.error?.message || "Fire extinguisher not found");
    error.statusCode = response.status;
    error.code = payload?.error?.code || "EXTINGUISHER_LOOKUP_FAILED";
    throw error;
  }

  if (payload.data?.status === "RETIRED") {
    const error = new Error("Cannot use a retired fire extinguisher");
    error.statusCode = 400;
    error.code = "EXTINGUISHER_RETIRED";
    throw error;
  }

  return payload.data;
};
