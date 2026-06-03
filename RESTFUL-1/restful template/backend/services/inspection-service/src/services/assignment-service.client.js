import { env } from "../config/env.js";

/**
 * Verify that `userId` has an active assignment for `extinguisherId`.
 * Calls GET /api/extinguishers/:id on the extinguisher-service using the
 * caller's Bearer token so standard auth + ownership checks apply.
 *
 * Throws a 403 if the extinguisher exists but isn't assigned to this user.
 */
export const verifyUserAssignment = async ({ req, extinguisherId, userId }) => {
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

  const ext = payload.data;

  if (ext.status === "RETIRED") {
    const error = new Error("Cannot request inspection for a retired extinguisher");
    error.statusCode = 400;
    error.code = "EXTINGUISHER_RETIRED";
    throw error;
  }

  if (!ext.assignment || ext.assignment.assignedUserId !== userId) {
    const error = new Error("You can only request inspections for extinguishers assigned to you");
    error.statusCode = 403;
    error.code = "EXTINGUISHER_NOT_ASSIGNED_TO_USER";
    throw error;
  }

  return ext;
};
