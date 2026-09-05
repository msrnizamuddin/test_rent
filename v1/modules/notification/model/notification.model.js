import { prisma } from "../../../../config/db.js";

const mapNotification = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    message: row.message,
    type: row.type,
    channel: row.channel,
    isRead: row.isRead,
    metadata: row.metadata,
    createdAt: row.createdAt,
  };
};

const SELECT = {
  id: true,
  userId: true,
  title: true,
  message: true,
  type: true,
  channel: true,
  isRead: true,
  metadata: true,
  createdAt: true,
};

// Reusable helper other modules can import to push a notification
// (e.g. "Vehicle Assigned", "Trip Started").
const create = async ({ userId, title, message, type, channel, metadata }) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type: type || null,
      channel: channel || "in_app",
      metadata: metadata ?? null,
    },
    select: SELECT,
  });

  // TODO: dispatch via SMS/email/push provider once wired up, based on `channel`

  return mapNotification(notification);
};

const findById = async (id) => {
  const notification = await prisma.notification.findUnique({ where: { id }, select: SELECT });
  return mapNotification(notification);
};

const findForUser = async ({ userId, isRead, page, limit }) => {
  const where = { userId, ...(typeof isRead === "boolean" ? { isRead } : {}) };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      select: SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return { notifications: notifications.map(mapNotification), total };
};

const findAll = async ({ userId, channel, page, limit }) => {
  const where = { ...(userId ? { userId } : {}), ...(channel ? { channel } : {}) };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      select: SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return { notifications: notifications.map(mapNotification), total };
};

// Safe "get everything" — no where clause, no pagination.
const getAll = async () => {
  const notifications = await prisma.notification.findMany({
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });
  return notifications.map(mapNotification);
};

const markReadForUser = async (id, userId) => {
  const { count } = await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
  if (count === 0) return null;
  return findById(id);
};

const markAllReadForUser = async (userId) => {
  const { count } = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { updated: count };
};

const deleteForUser = async (id, userId) => {
  const { count } = await prisma.notification.deleteMany({ where: { id, userId } });
  return count > 0 ? { id } : null;
};

export default {
  create,
  findById,
  findForUser,
  findAll,
  getAll,
  markReadForUser,
  markAllReadForUser,
  deleteForUser,
};
