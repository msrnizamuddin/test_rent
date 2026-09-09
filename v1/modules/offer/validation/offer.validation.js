import Joi from "joi";
import { requiredMessage } from "../../../utils/joi-messages.js";

const objectId = Joi.string().guid({ version: "uuidv4" });

const TRIP_TYPES = ["single", "round", "down"];
const OFFER_STATUSES = ["active", "inactive"];
const DISCOUNT_TYPES = ["percentage", "fixed"];

export const searchOfferValidation = Joi.object({
  status: Joi.string().valid(...OFFER_STATUSES).optional(),
  tripType: Joi.string().valid(...TRIP_TYPES).optional(),
});

export const offerIdParamValidation = Joi.object({
  offerId: objectId.required().messages(requiredMessage("Offer id")),
});

export const createOfferValidation = Joi.object({
  title: Joi.string().trim().required().messages(requiredMessage("Title")),
  subtitle: Joi.string().trim().allow("", null).optional(),
  tripType: Joi.string().valid(...TRIP_TYPES).optional(),
  status: Joi.string().valid(...OFFER_STATUSES).optional(),
  fromLocation: Joi.string().trim().allow("", null).optional(),
  toLocation: Joi.string().trim().allow("", null).optional(),
  discountType: Joi.string().valid(...DISCOUNT_TYPES).optional(),
  discountValue: Joi.number().min(0).required().messages(requiredMessage("Discount value")),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  bannerImage: Joi.string().uri().allow("", null).optional(),
  offerText: Joi.string().allow("", null).optional(),
});

export const updateOfferValidation = Joi.object({
  title: Joi.string().trim(),
  subtitle: Joi.string().trim().allow("", null),
  tripType: Joi.string().valid(...TRIP_TYPES).allow(null),
  status: Joi.string().valid(...OFFER_STATUSES),
  fromLocation: Joi.string().trim().allow("", null),
  toLocation: Joi.string().trim().allow("", null),
  discountType: Joi.string().valid(...DISCOUNT_TYPES),
  discountValue: Joi.number().min(0),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null),
  bannerImage: Joi.string().uri().allow("", null),
  offerText: Joi.string().allow("", null),
}).min(1);
