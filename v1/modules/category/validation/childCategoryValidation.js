import Joi from "joi";

export const createChildCategorySchemaValidation = Joi.object({
  tenantId: Joi.string()
    .required()
    .messages({
      "string.base": "Tenant ID must be a string",
      "any.required": "Tenant ID is required",
    }),

  type: Joi.string()
    .valid("Child")
    .required()
    .messages({
      "string.base": "Type must be a string",
      "any.only": 'Type must be "Child"',
      "any.required": "Type is required",
    }),

  centralStatus: Joi.string()
    .valid("active", "inactive")
    .default("active")
    .messages({
      "any.only": 'Central status must be "active" or "inactive"',
    }),

  status: Joi.string()
    .valid("active", "inactive")
    .default("active")
    .messages({
      "any.only": 'Status must be "active" or "inactive"',
    }),

  name: Joi.object({
    en: Joi.string().trim().messages({
      "string.base": "English name must be a string",
    }),
    ar: Joi.string().trim().messages({
      "string.base": "Arabic name must be a string",
    }),
  }),

  slug: Joi.string()
    .trim()
    .required()
    .messages({
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

  updatedBy: Joi.string().hex().length(24).messages({
    "string.hex": "updatedBy must be a valid ObjectId",
    "string.length": "updatedBy must be 24 characters",
  }),
});

export const updateChildCategorySchemaValidation = Joi.object({
  type: Joi.string()
    .valid("Child")
    .messages({
      "any.only": 'Type must be "Child"',
    }),

  centralStatus: Joi.string()
    .valid("active", "inactive")
    .messages({
      "any.only": 'Central status must be "active" or "inactive"',
    }),

  status: Joi.string()
    .valid("active", "inactive")
    .messages({
      "any.only": 'Status must be "active" or "inactive"',
    }),

  name: Joi.object({
    en: Joi.string().trim(),
    ar: Joi.string().trim(),
  }),

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
});