import Joi from "joi";
import { requiredMessage } from "../../../utils/joi-messages.js";

const objectId = Joi.string().guid({ version: "uuidv4" });
const tripType = Joi.string().valid("single", "round", "down");
const vehicleCondition = Joi.string().valid("new", "old");

export const searchPricingValidation = Joi.object({
  tripType: tripType.optional(),
  categoryId: objectId.optional(),
  vehicleId: objectId.optional(),
  vehicleCondition: vehicleCondition.optional(),
  isActive: Joi.boolean().optional(),
});

export const pricingIdParamValidation = Joi.object({
  pricingId: objectId.required().messages(requiredMessage("Pricing id")),
});

// Legacy/optional fields — not surfaced by the admin's category+condition
// pricing screen, but still accepted for any other future pricing UI.
const optionalRateFields = {
  tripType: tripType.optional(),
  vehicleId: objectId.optional(),
  perKmRate: Joi.number().min(0),
  perHourRate: Joi.number().min(0),
  perDayRate: Joi.number().min(0),
  driverCharge: Joi.number().min(0),
  waitingCharge: Joi.number().min(0),
  nightCharge: Joi.number().min(0),
  serviceCharge: Joi.number().min(0),
  taxPercent: Joi.number().min(0).max(100),
  viewPriceLowOffset: Joi.number().min(0),
  viewPriceHighOffset: Joi.number().min(0),
};

// The base-package pricing engine: basePrice covers up to baseHours and
// includedKm; extraKmCharge/extraHourPrice bill anything beyond either.
const baseTierFields = {
  basePrice: Joi.number().min(0),
  baseHours: Joi.number().min(0),
  includedKm: Joi.number().min(0),
  extraKmCharge: Joi.number().min(0),
  extraHourPrice: Joi.number().min(0),
};

export const createPricingValidation = Joi.object({
  name: Joi.string().trim().required().messages(requiredMessage("Name")),
  categoryId: objectId.required().messages(requiredMessage("Vehicle category")),
  vehicleCondition: vehicleCondition.required().messages(requiredMessage("Vehicle condition")),
  basePrice: baseTierFields.basePrice.required().messages(requiredMessage("Base price")),
  baseHours: baseTierFields.baseHours.required().messages(requiredMessage("Base hours")),
  includedKm: baseTierFields.includedKm.required().messages(requiredMessage("Included KM")),
  extraKmCharge: baseTierFields.extraKmCharge.required().messages(requiredMessage("Extra KM price")),
  extraHourPrice: baseTierFields.extraHourPrice
    .required()
    .messages(requiredMessage("Extra hour price")),
  isActive: Joi.boolean().optional(),
  ...optionalRateFields,
});

export const updatePricingValidation = Joi.object({
  name: Joi.string().trim(),
  categoryId: objectId.allow(null),
  vehicleCondition: vehicleCondition.allow(null),
  isActive: Joi.boolean(),
  ...Object.fromEntries(Object.entries(baseTierFields).map(([k, v]) => [k, v])),
  ...Object.fromEntries(Object.entries(optionalRateFields).map(([k, v]) => [k, v.allow?.(null) ?? v])),
}).min(1);
