import { env } from "../config/env.js";

export const createNotification = async ({ req, userId, type, title, message, metadata }) => {
  if (!userId) return;

  try {
    await fetch(env.notificationServiceUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-request-id": req?.requestId || "",
      },
      body: JSON.stringify({ userId, type, title, message, metadata: metadata || {} }),
    });
  } catch {
    console.warn({ requestId: req?.requestId, message: "Notification creation failed" });
  }
};
