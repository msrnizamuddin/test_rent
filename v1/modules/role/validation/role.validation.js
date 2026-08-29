import Joi from "joi";

// MongoDB ObjectId pattern
const objectId = Joi.string().hex().length(24).messages({
  "string.hex": "Invalid ObjectId format",
  "string.length": "Invalid ObjectId length",
});

// ---- Create Role Validation ----
export const createRoleSchema = Joi.object({
  roleName: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Role name is required",
    "string.min": "Role name must be at least 2 characters",
    "string.max": "Role name must not exceed 100 characters",
    "any.required": "Role name is required",
  }),

  description: Joi.string().trim().max(500).allow("", null).messages({
    "string.max": "Description must not exceed 500 characters",
  }),

  permissions: Joi.array().items(objectId).default([]).messages({
    "array.base": "permissions must be an array of Permission IDs",
  }),

  currentStatus: Joi.string()
    .valid("Active", "Inactive")
    .default("Active")
    .messages({
      "any.only": "currentStatus must be either Active or Inactive",
    }),
});

// ---- Update Role Validation ----
export const updateRoleSchema = Joi.object({
  roleName: Joi.string().trim().min(2).max(100).messages({
    "string.min": "Role name must be at least 2 characters",
    "string.max": "Role name must not exceed 100 characters",
  }),

  description: Joi.string().trim().max(500).allow("", null),

  permissions: Joi.array().items(objectId).messages({
    "array.base": "permissions must be an array of Permission IDs",
  }),

  currentStatus: Joi.string().valid("Active", "Inactive").messages({
    "any.only": "currentStatus must be either Active or Inactive",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required to update",
  });


