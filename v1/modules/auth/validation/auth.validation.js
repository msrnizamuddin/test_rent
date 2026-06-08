import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("invalid objectId");
  }
  return value;
};

export const signupValidation = Joi.object({
  fullName: Joi.string().trim().required(),
  businessName: Joi.string().trim().required(),
  businessEmail: Joi.string().email().required(),
  centralStatus: Joi.string()
      .valid("active", "inactive")
      .default("active"),
  userType: Joi.string()
    .valid("superadmin", "tenant")
    .default("tenant"),
  emailOrPhone: Joi.alternatives().try(
  Joi.string().email(),
  Joi.string()
    .length(11)
    .pattern(/^01[3-9]\d{8}$/)
).required(),
  password: Joi.string()
    .min(8)
    .required(),
  supportedLanguages: Joi.array()
    .items(Joi.string()),
  supportedCurrency: Joi.array()
    .items(Joi.string()),
  createdBy: Joi.string()
      .custom(objectId)
      .optional(),
  updatedBy: Joi.string()
    .custom(objectId)
    .optional(),
  verificationToken: Joi.string()
    .optional(),
  clientLoginToken: Joi.string()
    .optional(),
  tokenExpiration: Joi.date()
    .optional(),
});
export const loginValidation = Joi.object({
  emailOrPhone: Joi.alternatives().try(
  Joi.string().email(),
  Joi.string()
    .length(11)
    .pattern(/^01[3-9]\d{8}$/)
).required(),
  password: Joi.string()
    .required(),
});

// Update (PATCH) validation for auth updates - require at least one allowed field
export const updateUserValidation = Joi.object({
  password: Joi.string().min(8),
  centralStatus: Joi.string().valid("active", "inactive"),
  supportedLanguages: Joi.array().items(Joi.string()),
  supportedCurrency: Joi.array().items(Joi.string()),
  emailOrPhone: Joi.alternatives().try(
    Joi.string().email(),
    Joi.string()
      .length(11)
      .pattern(/^01[3-9]\d{8}$/),
  ),
  userType: Joi.string().valid("superadmin", "tenant"),
}).min(1);