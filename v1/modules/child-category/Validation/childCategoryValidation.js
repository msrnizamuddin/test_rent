import Joi from "joi";

import mongoose from "mongoose";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const localizedStringSchema = Joi.object()
  .pattern(
    Joi.string(), // language key like "en", "bn"
    Joi.string().trim().allow(""),
  )
  .min(1)
  .messages({
    "object.min": "At least one language value is required for name",
  });

export const createChildCategorySchemaValidation = Joi.object({
  tenantId: Joi.string().required(),
  type: Joi.string().valid("Child").required().messages({
    "string.base": "Type must be a string",
    "any.only": 'Type must be "Child"',
    "any.required": "Type is required",
  }),

  subCategoryId: Joi.string().hex().length(24).required().messages({
    "string.hex": "subCategoryId must be a valid ObjectId",
    "string.length": "subCategoryId must be 24 characters",
    "any.required": "subCategoryId is required",
  }),

  name: localizedStringSchema.required().messages({
    "any.required": "Name is required",
  }),

  slug: Joi.string().trim().required().messages({
    "string.base": "Slug must be a string",
    "any.required": "Slug is required",
  }),
  profileImage: Joi.string().uri().messages({
    "string.base": "Profile image must be a string",
    "string.uri": "Profile image must be a valid URL",
  }),
  coverImage: Joi.string().uri().messages({
    "string.base": "Cover image must be a string",
    "string.uri": "Cover image must be a valid URL",
  }),
  createdBy: Joi.string().hex().length(24).messages({
    "string.hex": "createdBy must be a valid ObjectId",
    "string.length": "createdBy must be 24 characters",
  }),
  updatedBy: Joi.string().hex().length(24).messages({}),
});
export const updateChildCategorySchemaValidation = Joi.object({
  type: Joi.string().valid("Child").messages({
    "any.only": 'Type must be "Child"',
  }),

  subCategoryId: Joi.string().hex().length(24).messages({
    "string.hex": "subCategoryId must be a valid ObjectId",
    "string.length": "subCategoryId must be 24 characters",
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

  updatedBy: Joi.string().hex().length(24).messages({
    "string.hex": "updatedBy must be a valid ObjectId",
    "string.length": "updatedBy must be 24 characters",
  }),
}).min(1);
