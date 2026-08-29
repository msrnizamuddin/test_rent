import Joi from "joi";

// MongoDB ObjectId pattern
const objectId = Joi.string().hex().length(24).messages({
  "string.hex": "Invalid ObjectId format",
  "string.length": "Invalid ObjectId length",
});

// ---- Create Department Validation ----
export const createDepartmentSchema = Joi.object({
  departmentName: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Department name is required",
    "string.min": "Department name must be at least 2 characters",
    "string.max": "Department name must not exceed 100 characters",
    "any.required": "Department name is required",
  }),

  departmentCode: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9-]+$/)
    .min(2)
    .max(20)
    .required()
    .messages({
      "string.empty": "Department code is required",
      "string.pattern.base":
        "Department code can only contain letters, numbers, and hyphens",
      "any.required": "Department code is required",
    }),

  description: Joi.string().trim().max(500).allow("", null).messages({
    "string.max": "Description must not exceed 500 characters",
  }),

  centralStatus: Joi.string().valid("Active", "Inactive").default("Active").messages({
    "any.only": "centralStatus must be either Active or Inactive",
  }),
  status: Joi.string().valid("Active", "Inactive").default("Active").messages({
    "any.only": "Status must be either Active or Inactive",
  }),

  createdBy: objectId.optional().messages({
    "any.required": "createdBy is required",
  }),

  updatedBy: objectId.optional(),
});

// ---- Update Department Validation ----
// sob field optional, kintu at least ekta field thakte hobe
export const updateDepartmentSchema = Joi.object({
  departmentName: Joi.string().trim().min(2).max(100).messages({
    "string.min": "Department name must be at least 2 characters",
    "string.max": "Department name must not exceed 100 characters",
  }),

  departmentCode: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9-]+$/)
    .min(2)
    .max(20)
    .messages({
      "string.pattern.base":
        "Department code can only contain letters, numbers, and hyphens",
    }),

  description: Joi.string().trim().max(500).allow("", null),

  status: Joi.string().valid("Active", "Inactive").messages({
    "any.only": "Status must be either Active or Inactive",
  }),
  centralStatus: Joi.string().valid("Active", "Inactive").messages({
    "any.only": "centralStatus must be either Active or Inactive",
  }),

  updatedBy: objectId.optional().messages({
    "any.required": "updatedBy is required",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required to update",
  });

