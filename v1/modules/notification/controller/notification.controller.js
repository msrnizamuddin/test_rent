import notificationService from "../service/notification.service.js";

const handle = (fn) => async (req, res, next) => {
  try {
    const result = await fn(req, res);
    res.status(result.statusCode || 200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------- GET /mine ----------------
export const getMyNotifications = handle(async (req) => {
  const data = await notificationService.getMyNotifications(req.user.id, req.query);
  return { message: "Notifications fetched successfully", data };
});

// ---------------- PATCH /:notificationId/read ----------------
export const markRead = handle(async (req) => {
  const data = await notificationService.markRead(req.params.notificationId, req.user.id);
  return { message: "Notification marked as read", data };
});

// ---------------- PATCH /read-all ----------------
export const markAllRead = handle(async (req) => {
  const data = await notificationService.markAllRead(req.user.id);
  return { message: "All notifications marked as read", data };
});

// ---------------- DELETE /:notificationId ----------------
export const deleteNotification = handle(async (req) => {
  const data = await notificationService.deleteNotification(
    req.params.notificationId,
    req.user.id,
  );
  return { message: "Notification deleted successfully", data };
});

// ---------------- POST / (superadmin/manager manual send) ----------------
export const sendNotification = handle(async (req) => {
  const data = await notificationService.sendNotification(req.body);
  return { statusCode: 201, message: "Notification sent successfully", data };
});

// ---------------- GET / (superadmin/manager list all) ----------------
export const getAllNotifications = handle(async (req) => {
  const data = await notificationService.getAllNotifications(req.query);
  return { message: "Notifications fetched successfully", data };
});

// Safe "get everything" — no filters, no conditions.
export const getAll = handle(async () => {
  const data = await notificationService.getAll();
  return { message: "All notifications fetched successfully", data };
});
