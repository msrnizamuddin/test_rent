import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid ObjectId");
  }
  return value;
};

// name: { en: "Main Warehouse", bn: "প্রধান গুদাম", ... }
// key = language code (2-5 letters), value = non-empty trimmed string
const localizedNameSchema = Joi.object()
  .pattern(
    Joi.string().min(2).max(5),
    Joi.string().trim().min(1)
  )
  .min(1)
  .messages({
    "object.min": "At least one language name is required",
  });

export const createWarehouseValidation = Joi.object({
  tenantId: Joi.string()
    .guid({ version: ["uuidv4"] })
    .required()
    .messages({
      "any.required": "Tenant is required",
      "string.guid": "Invalid Tenant ID",
    }),

  centralStatus: Joi.string().valid("active", "inactive").default("active"),

  status: Joi.string().valid("active", "inactive").default("active"),

  name: localizedNameSchema.required().messages({
    "any.required": "Name is required",
  }),

  location: Joi.string().trim().allow("").optional(),

  createdBy: Joi.string().custom(objectId).optional(),

  updatedBy: Joi.string().custom(objectId).optional(),
});

export const updateWarehouseValidation = Joi.object({
  tenantId: Joi.string().guid({ version: ["uuidv4"] }).messages({
    "string.guid": "Invalid Tenant ID",
  }),

  centralStatus: Joi.string().valid("active", "inactive"),

  status: Joi.string().valid("active", "inactive"),

  name: localizedNameSchema,

  location: Joi.string().trim().allow(""),

  updatedBy: Joi.string().custom(objectId),
}).min(1);