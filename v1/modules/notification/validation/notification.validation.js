import Joi from "joi";
import { requiredMessage } from "../../../utils/joi-messages.js";

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
  notificationId: objectId.required().messages(requiredMessage("Notification id")),
});

// ---------------- POST / (superadmin/manager manual send) ----------------
export const sendNotificationValidation = Joi.object({
  userId: objectId.required().messages(requiredMessage("User id")),
  title: Joi.string().trim().required().messages(requiredMessage("Title")),
  message: Joi.string().trim().required().messages(requiredMessage("Message")),
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
