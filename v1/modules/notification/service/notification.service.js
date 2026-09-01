import Notification from "../model/notification.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// Reusable helper other modules can import to push a notification
// (e.g. "Vehicle Assigned", "Trip Started").
export const createNotification = ({ userId, title, message, type, channel, metadata }) =>
  Notification.create({ userId, title, message, type, channel, metadata });

// ---------------- GET /mine ----------------
const getMyNotifications = async (userId, query) => {
  const { isRead, page, limit } = query;
  const { notifications, total } = await Notification.findForUser({
    userId,
    isRead,
    page,
    limit,
  });

  return {
    notifications,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ---------------- PATCH /:notificationId/read ----------------
const markRead = async (notificationId, userId) => {
  const notification = await Notification.markReadForUser(notificationId, userId);
  if (!notification) throw buildError("Notification not found", 404);
  return notification;
};

// ---------------- PATCH /read-all ----------------
const markAllRead = async (userId) => Notification.markAllReadForUser(userId);

// ---------------- DELETE /:notificationId ----------------
const deleteNotification = async (notificationId, userId) => {
  const deleted = await Notification.deleteForUser(notificationId, userId);
  if (!deleted) throw buildError("Notification not found", 404);
  return { deleted: true };
};

// ---------------- POST / (admin manual send) ----------------
const sendNotification = async (payload) => createNotification(payload);

// ---------------- GET / (admin list all) ----------------
const getAllNotifications = async (query) => {
  const { userId, channel, page, limit } = query;
  const { notifications, total } = await Notification.findAll({
    userId,
    channel,
    page,
    limit,
  });

  return {
    notifications,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export default {
  createNotification,
  getMyNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  sendNotification,
  getAllNotifications,
};
