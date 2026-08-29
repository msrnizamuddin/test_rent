import Joi from "joi";
import mongoose from "mongoose";

// custom ObjectId validator
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

// reusable localized string schema, e.g. { en: "Nike", bn: "নাইকি" }
const localizedStringSchema = Joi.object()
  .pattern(
    Joi.string(), // language key like "en", "bn"
    Joi.string().trim().allow(""),
  )
  .min(1)
  .messages({
    "object.min": "At least one language value is required for name",
  });

export const createBrandValidation = Joi.object({
  tenantId: Joi.string().required().messages({
    "any.required": "Tenant is required",
    "any.invalid": "Invalid Tenant ID",
  }),

  centralStatus: Joi.string().valid("active", "inactive").default("active"),

  name: localizedStringSchema.required().messages({
    "any.required": "Name is required",
  }),

  slug: Joi.string().trim().lowercase().required().messages({
    "any.required": "Slug is required",
  }),

  profileImage: Joi.string().allow("").default(""),

  status: Joi.string().valid("active", "inactive").default("active"),

  createdBy: Joi.string().custom(objectId).optional().messages({
    "any.required": "CreatedBy is required",
    "any.invalid": "Invalid User ID",
  }),
});

export const updateBrandValidation = Joi.object({
  tenantId: Joi.string().custom(objectId).messages({
    "any.invalid": "Invalid Tenant ID",
  }),

  centralStatus: Joi.string().valid("active", "inactive"),

  name: localizedStringSchema,

  slug: Joi.string().trim().lowercase(),

  profileImage: Joi.string().allow(""),

  status: Joi.string().valid("active", "inactive"),

  updatedBy: Joi.string().custom(objectId).messages({
    "any.invalid": "Invalid User ID",
  }),
}).min(1);