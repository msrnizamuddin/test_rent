import Joi from "joi";

const objectId = Joi.string().guid({ version: "uuidv4" });

const NOTIFICATION_TYPES = Joi.string().trim();
const CHANNELS = ["push", "in_app", "sms", "email"];

// ---------------- GET /mine ----------------
export const getMyNotificationsValidation = Joi.object({
  isRead: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// ---------------- PATCH /:notificationId/read, DELETE /:notificationId ----------------
export const notificationIdParamValidation = Joi.object({
  notificationId: objectId.required(),
});

// ---------------- POST / (superadmin/manager manual send) ----------------
export const sendNotificationValidation = Joi.object({
  userId: objectId.required(),
  title: Joi.string().trim().required(),
  message: Joi.string().trim().required(),
  type: NOTIFICATION_TYPES.optional(),
  channel: Joi.string().valid(...CHANNELS).default("in_app"),
});

// ---------------- GET / (superadmin/manager list all) ----------------
export const getAllNotificationsValidation = Joi.object({
  userId: objectId.optional(),
  channel: Joi.string().valid(...CHANNELS).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
