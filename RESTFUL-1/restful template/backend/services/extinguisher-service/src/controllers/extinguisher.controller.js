import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { writeAuditLog } from "../services/audit.service.js";

const sizeToDb = {
  "1.5 lb": "SIZE_1_5_LB",
  "5 lb": "SIZE_5_LB",
  "9 lb": "SIZE_9_LB",
  "12 lb": "SIZE_12_LB",
};

const sizeFromDb = {
  SIZE_1_5_LB: "1.5 lb",
  SIZE_5_LB: "5 lb",
  SIZE_9_LB: "9 lb",
  SIZE_12_LB: "12 lb",
};

const toDate = (value) => (value ? new Date(value) : value);

const toApi = (extinguisher) => ({
  id: extinguisher.id,
  serialNumber: extinguisher.serialNumber,
  location: extinguisher.location,
  building: extinguisher.building,
  floor: extinguisher.floor,
  zone: extinguisher.zone,
  type: extinguisher.type,
  size: sizeFromDb[extinguisher.size] || extinguisher.size,
  installationDate: extinguisher.installationDate?.toISOString().slice(0, 10),
  expiryDate: extinguisher.expiryDate?.toISOString().slice(0, 10),
  status: extinguisher.status,
  createdByUserId: extinguisher.createdByUserId,
  updatedByUserId: extinguisher.updatedByUserId,
  createdAt: extinguisher.createdAt,
  updatedAt: extinguisher.updatedAt,
  statusHistory: extinguisher.statusHistory?.map((item) => ({
    id: item.id,
    oldStatus: item.oldStatus,
    newStatus: item.newStatus,
    reason: item.reason,
    changedByUserId: item.changedByUserId,
    createdAt: item.createdAt,
  })),
});

const toDbData = (body) => {
  const data = { ...body };
  if (data.size) data.size = sizeToDb[data.size];
  if (data.installationDate) data.installationDate = toDate(data.installationDate);
  if (data.expiryDate) data.expiryDate = toDate(data.expiryDate);
  if (data.floor === "") data.floor = null;
  if (data.zone === "") data.zone = null;
  return data;
};

const ensureDateRange = (data, current) => {
  const installationDate = data.installationDate || current?.installationDate;
  const expiryDate = data.expiryDate || current?.expiryDate;

  if (installationDate && expiryDate && expiryDate <= installationDate) {
    const error = new Error("expiryDate must be after installationDate");
    error.statusCode = 400;
    error.code = "INVALID_DATE_RANGE";
    throw error;
  }
};

const findByIdOrThrow = async (id, includeHistory = false) => {
  const extinguisher = await prisma.fireExtinguisher.findUnique({
    where: { id },
    include: includeHistory
      ? { statusHistory: { orderBy: { createdAt: "desc" } } }
      : undefined,
  });

  if (!extinguisher) {
    const error = new Error("Fire extinguisher not found");
    error.statusCode = 404;
    error.code = "EXTINGUISHER_NOT_FOUND";
    throw error;
  }

  return extinguisher;
};

const handlePrismaError = (error) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const conflict = new Error("Serial number must be unique");
    conflict.statusCode = 409;
    conflict.code = "SERIAL_NUMBER_EXISTS";
    throw conflict;
  }

  throw error;
};

export const createExtinguisher = async (req, res, next) => {
  try {
    const data = toDbData(req.body);
    ensureDateRange(data);

    const extinguisher = await prisma.fireExtinguisher.create({
      data: {
        ...data,
        createdByUserId: req.user.sub,
        updatedByUserId: req.user.sub,
        statusHistory: {
          create: {
            oldStatus: null,
            newStatus: data.status || "ACTIVE",
            reason: "Initial registration",
            changedByUserId: req.user.sub,
          },
        },
      },
      include: { statusHistory: { orderBy: { createdAt: "desc" } } },
    });

    await writeAuditLog({
      req,
      action: "EXTINGUISHER_CREATED",
      resourceId: extinguisher.id,
      outcome: "SUCCESS",
      metadata: { serialNumber: extinguisher.serialNumber },
    });

    res.status(201).json({ success: true, data: toApi(extinguisher) });
  } catch (error) {
    try {
      handlePrismaError(error);
    } catch (handled) {
      next(handled);
    }
  }
};

export const listExtinguishers = async (req, res, next) => {
  try {
    const query = req.validatedQuery || req.query;
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
    const where = {};

    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.building) where.building = { equals: query.building, mode: "insensitive" };
    if (query.floor) where.floor = { equals: query.floor, mode: "insensitive" };
    if (query.zone) where.zone = { equals: query.zone, mode: "insensitive" };
    if (query.expiryBefore) where.expiryDate = { lte: new Date(query.expiryBefore) };
    if (query.search) {
      where.OR = [
        { serialNumber: { contains: query.search, mode: "insensitive" } },
        { location: { contains: query.search, mode: "insensitive" } },
        { building: { contains: query.search, mode: "insensitive" } },
        { zone: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.fireExtinguisher.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.fireExtinguisher.count({ where }),
    ]);

    res.json({
      success: true,
      data: items.map(toApi),
      meta: { page, limit, total },
    });
  } catch (error) {
    next(error);
  }
};

export const getExtinguisherById = async (req, res, next) => {
  try {
    const extinguisher = await findByIdOrThrow(req.params.id, true);
    res.json({ success: true, data: toApi(extinguisher) });
  } catch (error) {
    next(error);
  }
};

export const updateExtinguisher = async (req, res, next) => {
  try {
    const current = await findByIdOrThrow(req.params.id);
    const data = toDbData(req.body);
    ensureDateRange(data, current);

    const statusChanged = data.status && data.status !== current.status;

    const extinguisher = await prisma.fireExtinguisher.update({
      where: { id: current.id },
      data: {
        ...data,
        updatedByUserId: req.user.sub,
        statusHistory: statusChanged
          ? {
              create: {
                oldStatus: current.status,
                newStatus: data.status,
                reason: "Status changed during extinguisher update",
                changedByUserId: req.user.sub,
              },
            }
          : undefined,
      },
      include: { statusHistory: { orderBy: { createdAt: "desc" } } },
    });

    await writeAuditLog({
      req,
      action: "EXTINGUISHER_UPDATED",
      resourceId: extinguisher.id,
      outcome: "SUCCESS",
      metadata: { serialNumber: extinguisher.serialNumber },
    });

    res.json({ success: true, data: toApi(extinguisher) });
  } catch (error) {
    try {
      handlePrismaError(error);
    } catch (handled) {
      next(handled);
    }
  }
};

export const updateExtinguisherStatus = async (req, res, next) => {
  try {
    const current = await findByIdOrThrow(req.params.id);

    if (req.body.status === current.status) {
      return res.json({ success: true, data: toApi(current) });
    }

    const extinguisher = await prisma.fireExtinguisher.update({
      where: { id: current.id },
      data: {
        status: req.body.status,
        updatedByUserId: req.user.sub,
        statusHistory: {
          create: {
            oldStatus: current.status,
            newStatus: req.body.status,
            reason: req.body.reason || null,
            changedByUserId: req.user.sub,
          },
        },
      },
      include: { statusHistory: { orderBy: { createdAt: "desc" } } },
    });

    await writeAuditLog({
      req,
      action: "EXTINGUISHER_STATUS_CHANGED",
      resourceId: extinguisher.id,
      outcome: "SUCCESS",
      metadata: { oldStatus: current.status, newStatus: extinguisher.status },
    });

    res.json({ success: true, data: toApi(extinguisher) });
  } catch (error) {
    next(error);
  }
};

export const retireExtinguisher = async (req, res, next) => {
  try {
    const current = await findByIdOrThrow(req.params.id);

    const extinguisher = await prisma.fireExtinguisher.update({
      where: { id: current.id },
      data: {
        status: "RETIRED",
        updatedByUserId: req.user.sub,
        statusHistory: current.status === "RETIRED"
          ? undefined
          : {
              create: {
                oldStatus: current.status,
                newStatus: "RETIRED",
                reason: "Retired instead of hard delete",
                changedByUserId: req.user.sub,
              },
            },
      },
      include: { statusHistory: { orderBy: { createdAt: "desc" } } },
    });

    await writeAuditLog({
      req,
      action: "EXTINGUISHER_RETIRED",
      resourceId: extinguisher.id,
      outcome: "SUCCESS",
      metadata: { serialNumber: extinguisher.serialNumber },
    });

    res.json({ success: true, data: toApi(extinguisher) });
  } catch (error) {
    next(error);
  }
};
