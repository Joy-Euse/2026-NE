import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// ---------------------------------------------------------------------------
// Transporter factory
// ---------------------------------------------------------------------------

/**
 * Returns a ready-to-use Nodemailer transporter.
 *
 * Priority:
 *  1. Real SMTP when SMTP_HOST is set (production / Mailtrap / any SMTP provider)
 *  2. Ethereal (auto-created test account) in development when no SMTP is configured
 */
const createTransporter = async () => {
  if (env.smtpHost) {
    return nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure, // true for port 465, false for 587
      auth: env.smtpUser
        ? { user: env.smtpUser, pass: env.smtpPass }
        : undefined,
    });
  }

  // Development fallback: Ethereal gives a disposable inbox you can view
  // in the browser — no real email is sent.
  const testAccount = await nodemailer.createTestAccount();
  console.info("[email] No SMTP configured — using Ethereal test account");
  console.info(`[email] Preview inbox: https://ethereal.email/login`);
  console.info(`[email] Login: ${testAccount.user} / ${testAccount.pass}`);

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
};

// ---------------------------------------------------------------------------
// HTML email template
// ---------------------------------------------------------------------------

const buildPasswordResetHtml = (resetLink) => `<!DOCTYPE html>
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
    .btn-wrap { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; padding: 13px 32px; background: #e63946;
           color: #ffffff !important; text-decoration: none;
           border-radius: 6px; font-size: 15px; font-weight: 600; }
    .link-fallback { word-break: break-all; color: #64748b; font-size: 13px; }
    .footer { padding: 20px 32px; background: #f8fafc;
              border-top: 1px solid #e2e8f0; text-align: center; }
    .footer p { margin: 0; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🔥 Fire Extinguisher Management System</h1>
    </div>
    <div class="body">
      <p>Hi there,</p>
      <p>We received a request to reset the password for your account. Click the button below to create a new password. This link is valid for <strong>${env.passwordResetMinutes} minutes</strong>.</p>
      <div class="btn-wrap">
        <a class="btn" href="${resetLink}" target="_blank" rel="noopener noreferrer">Reset my password</a>
      </div>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p class="link-fallback">${resetLink}</p>
      <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Fire Extinguisher Management System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

export const buildPasswordResetLink = (resetToken) => {
  const url = new URL("/reset-password", env.frontendUrl);
  url.searchParams.set("token", resetToken);
  return url.toString();
};

export const sendPasswordResetEmail = async ({ email, resetLink }) => {
  const subject = "Reset your Fire Safety account password";

  const text = [
    "We received a request to reset your password.",
    `Open this link to set a new password (valid for ${env.passwordResetMinutes} minutes):`,
    resetLink,
    "If you did not request this, you can safely ignore this email.",
  ].join("\n\n");

  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: `"Fire Safety System" <${env.emailFrom}>`,
      to: email,
      subject,
      text,
      html: buildPasswordResetHtml(resetLink),
    });

    // Ethereal preview URL (only exists for test accounts)
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.info(`[email] Password reset email sent to ${email}`);
      console.info(`[email] Preview URL: ${previewUrl}`);
    } else {
      console.info(`[email] Password reset email sent to ${email} (messageId: ${info.messageId})`);
    }

    return {
      sent: true,
      provider: env.smtpHost ? "smtp" : "ethereal",
      messageId: info.messageId,
      previewUrl: previewUrl || undefined,
    };
  } catch (err) {
    console.error("[email] Failed to send password reset email:", err.message);
    const error = new Error("Unable to send password reset email");
    error.statusCode = 502;
    error.code = "EMAIL_SEND_FAILED";
    throw error;
  }
};
