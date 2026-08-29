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

export const createSubCategorySchemaValidation = Joi.object({
  tenantId: Joi.string().required().messages({
    "any.required": "Tenant is required",
    "any.invalid": "Invalid Tenant ID",
  }),

  categoryId: Joi.string().custom(objectId).required().messages({
    "any.required": "Category is required",
    "any.invalid": "Invalid Category ID",
  }),

  type: Joi.string().valid("Sub").required().messages({
    "string.base": "Type must be a string",
    "any.only": 'Type must be "Sub"',
    "any.required": "Type is required",
  }),

  centralStatus: Joi.string()
    .valid("active", "inactive")
    .default("active")
    .messages({
      "any.only": 'Central status must be "active" or "inactive"',
    }),

  status: Joi.string().valid("active", "inactive").default("active").messages({
    "any.only": 'Status must be "active" or "inactive"',
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

export const updateSubCategorySchemaValidation = Joi.object({
  categoryId: Joi.string().custom(objectId).messages({
    "any.invalid": "Invalid Category ID",
  }),

  type: Joi.string().valid("Sub").messages({
    "any.only": 'Type must be "Sub"',
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
