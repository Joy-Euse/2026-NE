import { prisma } from "../config/prisma.js";
import { writeAuditLog } from "../services/audit.service.js";

const publicProfile = (profile) => ({
  id: profile.id,
  authUserId: profile.authUserId,
  firstName: profile.firstName,
  lastName: profile.lastName,
  email: profile.email,
  role: profile.role,
  status: profile.status,
  phone: profile.phone,
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});

const findProfileByIdOrThrow = async (id) => {
  const profile = await prisma.userProfile.findUnique({ where: { id } });
  if (!profile) {
    const error = new Error("User not found");
    error.statusCode = 404;
    error.code = "USER_NOT_FOUND";
    throw error;
  }
  return profile;
};

export const createInternalUser = async (req, res, next) => {
  try {
    const existing = await prisma.userProfile.findFirst({
      where: {
        OR: [{ authUserId: req.body.authUserId }, { email: req.body.email }],
      },
    });

    if (existing) {
      const error = new Error("User profile already exists");
      error.statusCode = 409;
      error.code = "USER_PROFILE_ALREADY_EXISTS";
      throw error;
    }

    const profile = await prisma.userProfile.create({ data: req.body });

    await writeAuditLog({
      req,
      actorUserId: req.body.authUserId,
      action: "USER_PROFILE_CREATED",
      resourceType: "USER",
      resourceId: profile.id,
      outcome: "SUCCESS",
    });

    res.status(201).json({
      success: true,
      data: publicProfile(profile),
    });
  } catch (error) {
    next(error);
  }
};

export const getInternalUserByAuthId = async (req, res, next) => {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { authUserId: req.params.authUserId },
    });

    if (!profile) {
      const error = new Error("User profile not found");
      error.statusCode = 404;
      error.code = "USER_PROFILE_NOT_FOUND";
      throw error;
    }

    res.json({
      success: true,
      data: publicProfile(profile),
    });
  } catch (error) {
    next(error);
  }
};

export const getInternalUserById = async (req, res, next) => {
  try {
    const profile = await findProfileByIdOrThrow(req.params.id);

    res.json({
      success: true,
      data: publicProfile(profile),
    });
  } catch (error) {
    next(error);
  }
};

export const getOwnProfile = async (req, res, next) => {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { authUserId: req.user.sub },
    });

    if (!profile) {
      const error = new Error("User profile not found");
      error.statusCode = 404;
      error.code = "USER_PROFILE_NOT_FOUND";
      throw error;
    }

    res.json({
      success: true,
      data: publicProfile(profile),
    });
  } catch (error) {
    next(error);
  }
};

export const updateOwnProfile = async (req, res, next) => {
  try {
    const profile = await prisma.userProfile.update({
      where: { authUserId: req.user.sub },
      data: req.body,
    });

    await writeAuditLog({
      req,
      actorUserId: req.user.sub,
      action: "USER_PROFILE_UPDATED",
      resourceType: "USER",
      resourceId: profile.id,
      outcome: "SUCCESS",
    });

    res.json({
      success: true,
      data: publicProfile(profile),
    });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.userProfile.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.userProfile.count(),
    ]);

    res.json({
      success: true,
      data: users.map(publicProfile),
      meta: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const profile = await findProfileByIdOrThrow(req.params.id);

    res.json({
      success: true,
      data: publicProfile(profile),
    });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateUser = async (req, res, next) => {
  try {
    await findProfileByIdOrThrow(req.params.id);

    const profile = await prisma.userProfile.update({
      where: { id: req.params.id },
      data: req.body,
    });

    await writeAuditLog({
      req,
      actorUserId: req.user.sub,
      action: "USER_ADMIN_UPDATED",
      resourceType: "USER",
      resourceId: profile.id,
      outcome: "SUCCESS",
    });

    res.json({
      success: true,
      data: publicProfile(profile),
    });
  } catch (error) {
    next(error);
  }
};

export const changeUserRole = async (req, res, next) => {
  try {
    await findProfileByIdOrThrow(req.params.id);

    const profile = await prisma.userProfile.update({
      where: { id: req.params.id },
      data: { role: req.body.role },
    });

    await writeAuditLog({
      req,
      actorUserId: req.user.sub,
      action: "USER_ROLE_CHANGED",
      resourceType: "USER",
      resourceId: profile.id,
      outcome: "SUCCESS",
      metadata: { role: profile.role },
    });

    res.json({
      success: true,
      data: publicProfile(profile),
    });
  } catch (error) {
    next(error);
  }
};

export const changeUserStatus = async (req, res, next) => {
  try {
    await findProfileByIdOrThrow(req.params.id);

    const profile = await prisma.userProfile.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });

    await writeAuditLog({
      req,
      actorUserId: req.user.sub,
      action: "USER_STATUS_CHANGED",
      resourceType: "USER",
      resourceId: profile.id,
      outcome: "SUCCESS",
      metadata: { status: profile.status },
    });

    res.json({
      success: true,
      data: publicProfile(profile),
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateUser = async (req, res, next) => {
  try {
    await findProfileByIdOrThrow(req.params.id);

    const profile = await prisma.userProfile.update({
      where: { id: req.params.id },
      data: { status: "DEACTIVATED" },
    });

    await writeAuditLog({
      req,
      actorUserId: req.user.sub,
      action: "USER_DEACTIVATED",
      resourceType: "USER",
      resourceId: profile.id,
      outcome: "SUCCESS",
    });

    res.json({
      success: true,
      data: publicProfile(profile),
    });
  } catch (error) {
    next(error);
  }
};
