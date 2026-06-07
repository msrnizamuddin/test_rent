import Joi from "joi";

export const createCustomerValidation = Joi.object({
  firstName: Joi.string().trim().required(),

  lastName: Joi.string().trim().required(),

  email: Joi.string().email().trim().required(),

  phone: Joi.string().trim().required(),

  password: Joi.string().min(6).required(),

  profilePicture: Joi.string().uri().allow("", null),

  billingAddress: Joi.string().trim().allow("", null),

  shippingAddress: Joi.string().trim().allow("", null),

  isVerified: Joi.boolean(),

  isCentral: Joi.boolean(),

  centralStatus: Joi.string()
    .valid("active", "inactive"),

  status: Joi.string()
    .valid("active", "inactive"),
});

export const updateCustomerValidation = Joi.object({
  firstName: Joi.string().trim(),

  lastName: Joi.string().trim(),

  email: Joi.string().email().trim(),

  phone: Joi.string().trim(),

  profilePicture: Joi.string().uri().allow("", null),

  billingAddress: Joi.string().trim().allow("", null),

  shippingAddress: Joi.string().trim().allow("", null),

  isVerified: Joi.boolean(),

  isCentral: Joi.boolean(),

  centralStatus: Joi.string()
    .valid("active", "inactive"),

  status: Joi.string()
    .valid("active", "inactive"),
}).min(1);

