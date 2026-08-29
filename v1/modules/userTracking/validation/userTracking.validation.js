// validation/userTracking.validation.js
import Joi from "joi";
import mongoose from "mongoose";
import { logModule } from '../../../utils/moduleLogger.js';
logModule(import.meta.url);
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid ObjectId");
  }

  return value;
};

export const createUserTrackingValidation = Joi.object({
  userId: Joi.string().hex().length(24).allow(null),
  ip: Joi.string().trim(),
  userAgent: Joi.string().trim(),
  browserName: Joi.string().trim(),
  browserVersion: Joi.string().trim(),
  osName: Joi.string().trim(),
  osVersion: Joi.string().trim(),
  deviceType: Joi.string()
    .valid(
      "mobile",
      "tablet",
      "desktop",
      "smarttv",
      "console",
      "wearable",
      "unknown"
    )
    .default("unknown"),
  deviceVendor: Joi.string().trim(),
  deviceModel: Joi.string().trim(),
  country: Joi.string().trim(),
  city: Joi.string().trim(),
  language: Joi.string().trim(),
  timezone: Joi.string().trim(),
  screenWidth: Joi.number().integer().min(0),
  screenHeight: Joi.number().integer().min(0),
  currentUrl: Joi.string().trim(),
  referrer: Joi.string().trim(),
  eventType: Joi.string()
    .valid(
      "page_view",
      "login",
      "logout",
      "register",
      "api_call",
      "error",
      "custom"
    )
    .default("page_view"),
  eventName: Joi.string().trim(),
  metadata: Joi.object().unknown(true).default({}),
});

export const updateUserTrackingValidation =
  createUserTrackingValidation.min(1);

  export const deleteUserTrackingValidation = Joi.object({
  id: Joi.string().custom(objectId).required(),
});