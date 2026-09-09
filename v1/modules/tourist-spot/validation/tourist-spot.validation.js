import Joi from "joi";

const objectId = Joi.string().guid({ version: "uuidv4" });

export const searchTouristSpotValidation = Joi.object({
  status: Joi.string().valid("active", "inactive").optional(),
});

export const touristSpotIdParamValidation = Joi.object({
  touristSpotId: objectId.required(),
});

export const createTouristSpotValidation = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().trim().allow("", null).optional(),
  image: Joi.string().uri().optional(),
  location: Joi.string().trim().allow("", null).optional(),
  status: Joi.string().valid("active", "inactive").optional(),
});

export const updateTouristSpotValidation = Joi.object({
  name: Joi.string().trim(),
  description: Joi.string().trim().allow("", null),
  image: Joi.string().uri(),
  location: Joi.string().trim().allow("", null),
  status: Joi.string().valid("active", "inactive"),
}).min(1);
