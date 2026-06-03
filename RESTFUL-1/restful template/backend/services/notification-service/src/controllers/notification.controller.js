import { prisma } from "../config/prisma.js";

const toApi = (notification) => ({
  id: notification.id,
  userId: notification.userId,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  channel: notification.channel,
  isRead: notification.isRead,
  readAt: notification.readAt,
  metadata: notification.metadata,
  createdAt: notification.createdAt,
});

export const createNotification = async (req, res, next) => {
  try {
    const notification = await prisma.notification.create({ data: req.body });
    res.status(201).json({ success: true, data: toApi(notification) });
  } catch (error) {
    next(error);
  }
};

export const listNotifications = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const where = {};

    if (req.query.userId) where.userId = req.query.userId;
    if (req.query.isRead !== undefined) where.isRead = req.query.isRead === "true";

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({ success: true, data: items.map(toApi), meta: { page, limit, total } });
  } catch (error) {
    next(error);
  }
};
