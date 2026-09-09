import Joi from "joi";
import { requiredMessage } from "../../../utils/joi-messages.js";

const objectId = Joi.string().guid({ version: "uuidv4" });

// ---------------- POST / ----------------
export const createReviewValidation = Joi.object({
  tripId: objectId.required().messages(requiredMessage("Trip id")),
  driverRating: Joi.number().integer().min(1).max(5).optional(),
  vehicleRating: Joi.number().integer().min(1).max(5).optional(),
  reviewText: Joi.string().trim().allow("").optional(),
})
  .or("driverRating", "vehicleRating")
  .messages({
    "object.missing": "At least one of driverRating or vehicleRating is required",
  });

// ---------------- GET /driver/:driverId ----------------
export const driverIdParamValidation = Joi.object({
  driverId: objectId.required().messages(requiredMessage("Driver id")),
});

// ---------------- GET /vehicle/:vehicleId ----------------
export const vehicleIdParamValidation = Joi.object({
  vehicleId: objectId.required().messages(requiredMessage("Vehicle id")),
});

// ---------------- PATCH /:reviewId/hide, /unhide, DELETE /:reviewId ----------------
export const reviewIdParamValidation = Joi.object({
  reviewId: objectId.required().messages(requiredMessage("Review id")),
});

// ---------------- GET / (superadmin/manager) ----------------
export const getAllReviewsValidation = Joi.object({
  driverId: objectId.optional(),
  vehicleId: objectId.optional(),
  isHidden: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
