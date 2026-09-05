import Joi from "joi";

const objectId = Joi.string().guid({ version: "uuidv4" });
const tripType = Joi.string().valid("single", "round", "down");

export const searchPricingValidation = Joi.object({
  tripType: tripType.optional(),
  categoryId: objectId.optional(),
  vehicleId: objectId.optional(),
  isActive: Joi.boolean().optional(),
});

export const pricingIdParamValidation = Joi.object({
  pricingId: objectId.required(),
});

const rateFields = {
  perKmRate: Joi.number().min(0),
  perHourRate: Joi.number().min(0),
  perDayRate: Joi.number().min(0),
  driverCharge: Joi.number().min(0),
  waitingCharge: Joi.number().min(0),
  extraKmCharge: Joi.number().min(0),
  nightCharge: Joi.number().min(0),
  serviceCharge: Joi.number().min(0),
  taxPercent: Joi.number().min(0).max(100),
};

export const createPricingValidation = Joi.object({
  name: Joi.string().trim().required(),
  tripType: tripType.optional(),
  categoryId: objectId.optional(),
  vehicleId: objectId.optional(),
  isActive: Joi.boolean().optional(),
  ...rateFields,
});

export const updatePricingValidation = Joi.object({
  name: Joi.string().trim(),
  tripType: tripType.allow(null),
  categoryId: objectId.allow(null),
  vehicleId: objectId.allow(null),
  isActive: Joi.boolean(),
  ...Object.fromEntries(Object.entries(rateFields).map(([k, v]) => [k, v.allow(null)])),
}).min(1);
