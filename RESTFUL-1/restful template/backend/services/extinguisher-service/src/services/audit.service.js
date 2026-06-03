import { env } from "../config/env.js";

export const writeAuditLog = async ({ req, action, resourceId, outcome, metadata }) => {
  try {
    await fetch(env.auditLogServiceUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-request-id": req?.requestId || "",
      },
      body: JSON.stringify({
        actor_user_id: req?.user?.sub || null,
        action,
        resource_type: "FIRE_EXTINGUISHER",
        resource_id: resourceId || null,
        outcome,
        metadata: metadata || {},
      }),
    });
  } catch (error) {
    console.warn({ requestId: req?.requestId, message: "Audit log write failed" });
  }
};
