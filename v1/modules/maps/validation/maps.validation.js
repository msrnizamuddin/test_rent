import Joi from "joi";

export const autocompleteValidation = Joi.object({
  input: Joi.string().trim().min(1).required(),
  sessionToken: Joi.string().trim().optional(),
});

export const placeDetailsValidation = Joi.object({
  placeId: Joi.string().trim().required(),
  sessionToken: Joi.string().trim().optional(),
});

export const geocodeValidation = Joi.object({
  address: Joi.string().trim().min(1).required(),
});

export const distanceValidation = Joi.object({
  origin: Joi.string().trim().min(1).required(),
  destination: Joi.string().trim().min(1).required(),
});
