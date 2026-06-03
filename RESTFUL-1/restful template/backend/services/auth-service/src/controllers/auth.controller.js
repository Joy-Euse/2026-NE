import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { comparePassword, hashPassword, hashToken } from "../utils/hash.js";
import { addDays, addMinutes, createOpaqueToken } from "../utils/tokens.js";
import { signAccessToken, verifyAccessToken } from "../utils/jwt.js";
import { createUserProfile, getUserProfileByAuthId } from "../services/user-service.client.js";
import { writeAuditLog } from "../services/audit.service.js";
import { sendPasswordResetCodeEmail } from "../services/email.service.js";
import { randomInt } from "node:crypto";

const publicProfile = (profile) => ({
  id: profile.id,
  authUserId: profile.authUserId,
  firstName: profile.firstName,
  lastName: profile.lastName,
  email: profile.email,
  role: profile.role,
  status: profile.status,
  phone: profile.phone,
});

const issueTokens = async (profile) => {
  const accessToken = signAccessToken(profile);
  const refreshToken = createOpaqueToken();
  const tokenHash = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      userId: profile.authUserId,
      tokenHash,
      expiresAt: addDays(new Date(), env.refreshTokenDays),
    },
  });

  return { accessToken, refreshToken };
};

const assertActive = (credential, profile) => {
  if (credential.status !== "ACTIVE" || profile.status !== "ACTIVE") {
    const error = new Error("User account is not active");
    error.statusCode = 403;
    error.code = "ACCOUNT_NOT_ACTIVE";
    throw error;
  }
};

const createPasswordResetCode = () => String(randomInt(0, 100000)).padStart(5, "0");
const passwordResetCodeHash = (email, code) => hashToken(`${email.toLowerCase()}:${code}`);

const findValidResetCode = async ({ email, code }) => {
  const credential = await prisma.userCredential.findUnique({ where: { email } });
  if (!credential) return null;

  const storedToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: passwordResetCodeHash(email, code) },
  });

  if (
    !storedToken ||
    storedToken.userId !== credential.id ||
    storedToken.usedAt ||
    storedToken.expiresAt <= new Date()
  ) {
    return null;
  }

  return { credential, storedToken };
};

export const register = async (req, res, next) => {
  let credential;

  try {
    const { firstName, lastName, email, password } = req.body;

    const existing = await prisma.userCredential.findUnique({ where: { email } });
    if (existing) {
      const error = new Error("Email is already registered");
      error.statusCode = 409;
      error.code = "EMAIL_ALREADY_EXISTS";
      throw error;
    }

    credential = await prisma.userCredential.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
      },
    });

    const profile = await createUserProfile({
      req,
      authUserId: credential.id,
      firstName,
      lastName,
      email,
      role: "USER",
    });

    const tokens = await issueTokens(profile);

    await writeAuditLog({
      req,
      actorUserId: credential.id,
      action: "USER_REGISTERED",
      resourceType: "USER",
      resourceId: profile.id,
      outcome: "SUCCESS",
    });

    res.status(201).json({
      success: true,
      data: {
        user: publicProfile(profile),
        ...tokens,
      },
    });
  } catch (error) {
    if (credential) {
      await prisma.userCredential.delete({ where: { id: credential.id } }).catch(() => {});
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const credential = await prisma.userCredential.findUnique({ where: { email } });

    if (!credential || !(await comparePassword(password, credential.passwordHash))) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }

    const profile = await getUserProfileByAuthId({ req, authUserId: credential.id });
    assertActive(credential, profile);

    await prisma.userCredential.update({
      where: { id: credential.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await issueTokens(profile);

    await writeAuditLog({
      req,
      actorUserId: credential.id,
      action: "USER_LOGIN",
      resourceType: "USER",
      resourceId: profile.id,
      outcome: "SUCCESS",
    });

    res.json({
      success: true,
      data: {
        user: publicProfile(profile),
        ...tokens,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const tokenHash = hashToken(req.body.refreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
      const error = new Error("Refresh token is invalid or expired");
      error.statusCode = 401;
      error.code = "INVALID_REFRESH_TOKEN";
      throw error;
    }

    const profile = await getUserProfileByAuthId({ req, authUserId: storedToken.userId });
    assertActive(storedToken.user, profile);

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await issueTokens(profile);

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const tokenHash = hashToken(req.body.refreshToken);

    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await writeAuditLog({
      req,
      actorUserId: req.user?.sub,
      action: "USER_LOGOUT",
      resourceType: "SESSION",
      outcome: "SUCCESS",
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const validateToken = async (req, res, next) => {
  try {
    const claims = verifyAccessToken(req.body.token);
    const credential = await prisma.userCredential.findUnique({ where: { id: claims.sub } });
    const profile = await getUserProfileByAuthId({ req, authUserId: claims.sub });

    if (!credential) {
      const error = new Error("Token user does not exist");
      error.statusCode = 401;
      error.code = "INVALID_TOKEN_USER";
      throw error;
    }

    assertActive(credential, profile);

    res.json({
      success: true,
      data: {
        valid: true,
        user: publicProfile(profile),
        claims,
      },
    });
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    error.code = error.code || "INVALID_TOKEN";
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const credential = await prisma.userCredential.findUnique({ where: { id: req.user.sub } });

    if (!credential || !(await comparePassword(req.body.currentPassword, credential.passwordHash))) {
      const error = new Error("Current password is incorrect");
      error.statusCode = 400;
      error.code = "INVALID_CURRENT_PASSWORD";
      throw error;
    }

    await prisma.userCredential.update({
      where: { id: credential.id },
      data: { passwordHash: await hashPassword(req.body.newPassword) },
    });

    await prisma.refreshToken.updateMany({
      where: { userId: credential.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await writeAuditLog({
      req,
      actorUserId: credential.id,
      action: "PASSWORD_CHANGED",
      resourceType: "USER",
      resourceId: credential.id,
      outcome: "SUCCESS",
    });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email;
    const credential = await prisma.userCredential.findUnique({ where: { email } });

    if (credential) {
      const resetCode = createPasswordResetCode();
      await prisma.passwordResetToken.updateMany({
        where: { userId: credential.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      await prisma.passwordResetToken.upsert({
        where: { tokenHash: passwordResetCodeHash(email, resetCode) },
        create: {
          userId: credential.id,
          tokenHash: passwordResetCodeHash(email, resetCode),
          expiresAt: addMinutes(new Date(), env.passwordResetMinutes),
        },
        update: {
          userId: credential.id,
          expiresAt: addMinutes(new Date(), env.passwordResetMinutes),
          usedAt: null,
        },
      });

      await writeAuditLog({
        req,
        actorUserId: credential.id,
        action: "PASSWORD_RESET_REQUESTED",
        resourceType: "USER",
        resourceId: credential.id,
        outcome: "SUCCESS",
      });

      await sendPasswordResetCodeEmail({ email: credential.email, resetCode });
    }

    res.json({
      success: true,
      message: "If the email exists, a password reset code has been sent",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyResetCode = async (req, res, next) => {
  try {
    const result = await findValidResetCode({ email: req.body.email, code: req.body.code });

    if (!result) {
      const error = new Error("Password reset code is invalid or expired");
      error.statusCode = 400;
      error.code = "INVALID_RESET_CODE";
      throw error;
    }

    res.json({
      success: true,
      message: "Reset code verified",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await findValidResetCode({ email: req.body.email, code: req.body.code });

    if (!result) {
      const error = new Error("Password reset code is invalid or expired");
      error.statusCode = 400;
      error.code = "INVALID_RESET_CODE";
      throw error;
    }

    const { credential, storedToken } = result;

    await prisma.userCredential.update({
      where: { id: credential.id },
      data: { passwordHash: await hashPassword(req.body.newPassword) },
    });

    await prisma.passwordResetToken.update({
      where: { id: storedToken.id },
      data: { usedAt: new Date() },
    });

    await prisma.refreshToken.updateMany({
      where: { userId: credential.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await writeAuditLog({
      req,
      actorUserId: credential.id,
      action: "PASSWORD_RESET_COMPLETED",
      resourceType: "USER",
      resourceId: credential.id,
      outcome: "SUCCESS",
    });

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};
