import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const localizedStringSchema = Joi.object()
  .pattern(Joi.string(), Joi.string().trim().allow(""))
  .min(1)
  .messages({
    "object.min": "At least one language value is required for name",
  });

export const createCategorySchemaValidation = Joi.object({
  tenantId: Joi.string().required().messages({
    "any.required": "Tenant is required",
    "any.invalid": "Invalid Tenant ID",
  }),

  type: Joi.string().valid("Parent").required().messages({
    "any.only": 'Type must be "Parent"',
    "any.required": "Type is required",
  }),

  name: localizedStringSchema.required().messages({
    "any.required": "Name is required",
  }),

  slug: Joi.string().trim().required().messages({
    "any.required": "Slug is required",
  }),

  profileImage: Joi.string().uri().messages({
    "string.uri": "Profile image must be a valid URL",
  }),

  coverImage: Joi.string().uri().messages({
    "string.uri": "Cover image must be a valid URL",
  }),
});

export const updateCategorySchemaValidation = Joi.object({
  type: Joi.string().valid("Parent").messages({
    "any.only": 'Type must be "Parent"',
  }),

  centralStatus: Joi.string().valid("active", "inactive").messages({
    "any.only": 'Central status must be "active" or "inactive"',
  }),

  status: Joi.string().valid("active", "inactive").messages({
    "any.only": 'Status must be "active" or "inactive"',
  }),

  name: localizedStringSchema,

  slug: Joi.string().trim().messages({
    "string.base": "Slug must be a string",
  }),

  profileImage: Joi.string().uri().messages({
    "string.uri": "Profile image must be a valid URL",
  }),

  coverImage: Joi.string().uri().messages({
    "string.uri": "Cover image must be a valid URL",
  }),
}).min(1);
