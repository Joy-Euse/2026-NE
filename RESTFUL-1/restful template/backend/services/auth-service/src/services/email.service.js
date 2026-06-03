import { env } from "../config/env.js";

export const buildPasswordResetLink = (resetToken) => {
  const url = new URL("/reset-password", env.frontendUrl);
  url.searchParams.set("token", resetToken);
  return url.toString();
};

export const sendPasswordResetEmail = async ({ email, resetLink }) => {
  const subject = "Reset your Fire Safety account password";
  const text = [
    "We received a request to reset your password.",
    `Open this link to set a new password: ${resetLink}`,
    "If you did not request this, you can ignore this email.",
  ].join("\n\n");

  if (!env.emailApiUrl) {
    if (env.nodeEnv !== "production") {
      console.info({ message: "Password reset email", email, resetLink });
    }
    return { sent: false, provider: "development-log" };
  }

  const response = await fetch(env.emailApiUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(env.emailApiKey ? { authorization: `Bearer ${env.emailApiKey}` } : {}),
    },
    body: JSON.stringify({
      from: env.emailFrom,
      to: email,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const error = new Error("Unable to send password reset email");
    error.statusCode = 502;
    error.code = "EMAIL_SEND_FAILED";
    throw error;
  }

  return { sent: true, provider: "email-api" };
};
