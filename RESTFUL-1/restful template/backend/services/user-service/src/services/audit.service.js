import { env } from "../config/env.js";

export const writeAuditLog = async ({ req, actorUserId, action, resourceType, resourceId, outcome, metadata }) => {
  try {
    await fetch(env.auditLogServiceUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-request-id": req?.requestId || "",
      },
      body: JSON.stringify({
        actor_user_id: actorUserId || null,
        action,
        resource_type: resourceType,
        resource_id: resourceId || null,
        outcome,
        metadata: metadata || {},
      }),
    });
  } catch (error) {
    console.warn({ requestId: req?.requestId, message: "Audit log write failed" });
  }
};
