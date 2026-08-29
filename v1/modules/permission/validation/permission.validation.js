import Joi from "joi";

// ---- Create Permission Validation ----
export const createPermissionSchema = Joi.object({
  permissionName: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "permissionName is required",
    "string.min": "permissionName must be at least 2 characters",
    "string.max": "permissionName must not exceed 100 characters",
    "any.required": "permissionName is required",
  }),

  module: Joi.string().trim().max(50).allow("", null).messages({
    "string.max": "module must not exceed 50 characters",
  }),

  action: Joi.string().valid("create", "read", "update", "delete").messages({
    "any.only": "action must be one of create, read, update, delete",
  }),

  description: Joi.string().trim().max(500).allow("", null).messages({
    "string.max": "Description must not exceed 500 characters",
  }),

  centralStatus: Joi.string()
    .valid("Active", "Inactive")
    .default("Active")
    .messages({
      "any.only": "Central status must be either Active or Inactive",
    }),
});

// ---- Update Permission Validation ----
export const updatePermissionSchema = Joi.object({
  permissionName: Joi.string().trim().min(2).max(100).messages({
    "string.min": "permissionName must be at least 2 characters",
    "string.max": "permissionName must not exceed 100 characters",
  }),

  module: Joi.string().trim().max(50).allow("", null),

  action: Joi.string().valid("create", "read", "update", "delete").messages({
    "any.only": "action must be one of create, read, update, delete",
  }),

  description: Joi.string().trim().max(500).allow("", null),

  centralStatus: Joi.string().valid("Active", "Inactive").messages({
    "any.only": "Central status must be either Active or Inactive",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required to update",
  });
