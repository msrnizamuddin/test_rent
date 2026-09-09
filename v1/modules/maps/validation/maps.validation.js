import Joi from "joi";
import { requiredMessage } from "../../../utils/joi-messages.js";

export const autocompleteValidation = Joi.object({
  input: Joi.string().trim().min(1).required().messages(requiredMessage("Input")),
  sessionToken: Joi.string().trim().optional(),
});

export const placeDetailsValidation = Joi.object({
  placeId: Joi.string().trim().required().messages(requiredMessage("Place id")),
  sessionToken: Joi.string().trim().optional(),
});

export const geocodeValidation = Joi.object({
  address: Joi.string().trim().min(1).required().messages(requiredMessage("Address")),
});

export const distanceValidation = Joi.object({
  origin: Joi.string().trim().min(1).required().messages(requiredMessage("Origin")),
  destination: Joi.string().trim().min(1).required().messages(requiredMessage("Destination")),
});
