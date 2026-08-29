import Joi from "joi";

// MongoDB ObjectId pattern
const objectId = Joi.string().hex().length(24).messages({
  "string.hex": "Invalid ObjectId format",
  "string.length": "Invalid ObjectId length",
});

// ---- Create Designation Validation ----
export const createDesignationSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Designation title is required",
    "string.min": "Designation title must be at least 2 characters",
    "string.max": "Designation title must not exceed 100 characters",
    "any.required": "Designation title is required",
  }),

  department: objectId.required().messages({
    "any.required": "Department is required",
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

  createdBy: objectId.optional().messages({
    "any.required": "createdBy is required",
  }),

  updatedBy: objectId.optional(),
});

// ---- Update Designation Validation ----
export const updateDesignationSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).messages({
    "string.min": "Designation title must be at least 2 characters",
    "string.max": "Designation title must not exceed 100 characters",
  }),

  department: objectId,

  description: Joi.string().trim().max(500).allow("", null),

  centralStatus: Joi.string().valid("Active", "Inactive").messages({
    "any.only": "Central status must be either Active or Inactive",
  }),

  updatedBy: objectId.optional().messages({
    "any.required": "updatedBy is required",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required to update",
  });

