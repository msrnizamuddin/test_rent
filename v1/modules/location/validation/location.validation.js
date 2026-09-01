import Joi from "joi";

const objectId = Joi.string().guid({ version: "uuidv4" });

export const searchLocationValidation = Joi.object({
  search: Joi.string().trim().optional(),
  city: Joi.string().trim().optional(),
  type: Joi.string().valid("pickup", "dropoff", "popular").optional(),
  isActive: Joi.boolean().optional(),
});

export const locationIdParamValidation = Joi.object({
  locationId: objectId.required(),
});

export const createLocationValidation = Joi.object({
  name: Joi.string().trim().required(),
  address: Joi.string().trim().allow("", null).optional(),
  city: Joi.string().trim().allow("", null).optional(),
  district: Joi.string().trim().allow("", null).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  type: Joi.string().valid("pickup", "dropoff", "popular").optional(),
  isActive: Joi.boolean().optional(),
});

export const updateLocationValidation = Joi.object({
  name: Joi.string().trim(),
  address: Joi.string().trim().allow("", null),
  city: Joi.string().trim().allow("", null),
  district: Joi.string().trim().allow("", null),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  type: Joi.string().valid("pickup", "dropoff", "popular"),
  isActive: Joi.boolean(),
}).min(1);
