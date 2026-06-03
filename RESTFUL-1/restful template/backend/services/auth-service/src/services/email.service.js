import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const createTransporter = async () => {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    const error = new Error("SMTP email is not configured");
    error.statusCode = 500;
    error.code = "EMAIL_NOT_CONFIGURED";
    throw error;
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    requireTLS: !env.smtpSecure,
    auth: { user: env.smtpUser, pass: env.smtpPass },
  });
};

const buildPasswordResetCodeHtml = (resetCode) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
  <style>
    body { margin: 0; padding: 0; background: #f1f5f9; font-family: Arial, sans-serif; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff;
               border-radius: 8px; overflow: hidden;
               box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .header { background: #1e293b; padding: 24px 32px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 18px; }
    .body { padding: 32px; }
    .body p { margin: 0 0 16px; color: #475569; font-size: 15px; line-height: 1.6; }
    .code { margin: 28px 0; padding: 18px; background: #f8fafc; border: 1px solid #e2e8f0;
            border-radius: 6px; text-align: center; color: #0f172a; font-size: 32px;
            font-weight: 700; letter-spacing: 8px; }
    .footer { padding: 20px 32px; background: #f8fafc;
              border-top: 1px solid #e2e8f0; text-align: center; }
    .footer p { margin: 0; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Fire Extinguisher Management System</h1>
    </div>
    <div class="body">
      <p>Hi there,</p>
      <p>We received a request to reset the password for your account. Enter this verification code in the app. This code is valid for <strong>${env.passwordResetMinutes} minutes</strong>.</p>
      <div class="code">${resetCode}</div>
      <p>If you did not request a password reset, you can safely ignore this email. Your password will not be changed.</p>
    </div>
    <div class="footer">
      <p>Copyright ${new Date().getFullYear()} Fire Extinguisher Management System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

export const sendPasswordResetCodeEmail = async ({ email, resetCode }) => {
  const subject = "Your Fire Safety password reset code";
  const fromAddress = env.smtpUser || env.emailFrom;
  const text = [
    "We received a request to reset your password.",
    `Your password reset code is: ${resetCode}`,
    `This code is valid for ${env.passwordResetMinutes} minutes.`,
    "If you did not request this, you can safely ignore this email.",
  ].join("\n\n");

  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: `"Fire Safety System" <${fromAddress}>`,
      sender: fromAddress,
      replyTo: fromAddress,
      envelope: {
        from: fromAddress,
        to: email,
      },
      to: email,
      subject,
      text,
      html: buildPasswordResetCodeHtml(resetCode),
    });

    if (!info.accepted?.includes(email)) {
      const error = new Error(`SMTP did not accept recipient ${email}`);
      error.statusCode = 502;
      error.code = "EMAIL_RECIPIENT_REJECTED";
      error.details = {
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
      };
      throw error;
    }

    console.info(
      `[email] Password reset code email accepted for ${email} ` +
        `(messageId: ${info.messageId}, response: ${info.response})`
    );

    return {
      sent: true,
      provider: "smtp",
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    };
  } catch (err) {
    console.error("[email] Failed to send password reset email:", err.message);
    const error = new Error("Unable to send password reset email");
    error.statusCode = err.statusCode || 502;
    error.code = err.code || "EMAIL_SEND_FAILED";
    throw error;
  }
};
