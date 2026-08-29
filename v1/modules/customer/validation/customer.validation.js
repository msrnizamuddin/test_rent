import Joi from "joi";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
const addressValidation = Joi.object({
  district: Joi.string().trim(),
  thana: Joi.string().trim(),
  addressLine: Joi.string().trim(),
});
export const customerAddressValidation = Joi.object({
  district: Joi.string().trim().required(),
  thana: Joi.string().trim().required(),
  addressLine: Joi.string().trim().required(),
  isDefault: Joi.boolean().optional(),
});
const emailField = Joi.string().trim().lowercase().email().optional().allow("");
const phoneField = Joi.string().trim().optional().allow("");
export const createCustomerValidation = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  email: emailField,
  phone: phoneField,
  password: Joi.string().min(8).required(),
  profilePicture: Joi.string().allow(null, ""),
  billingAddress: addressValidation,
  shippingAddress: addressValidation,
})
  .custom((value, helpers) => {
    if (!value.email && !value.phone) {
      return helpers.error("any.identifier");
    }
    return value;
  })
  .messages({
    "any.identifier": "Either email or phone number is required.",
  });
export const loginCustomerValidation = Joi.object({
  email: emailField,
  phone: phoneField,
  password: Joi.string().required(),
})
  .custom((value, helpers) => {
    if (!value.email && !value.phone) {
      return helpers.error("any.identifier");
    }
    return value;
  })
  .messages({
    "any.identifier": "Either email or phone number is required.",
  });
export const updateCustomerValidation = Joi.object({
  firstName: Joi.string().trim(),
  lastName: Joi.string().trim(),
  email: emailField,
  phone: phoneField,
  password: Joi.string().min(8),
  profilePicture: Joi.string().allow(null, ""),
  billingAddress: addressValidation,
  shippingAddress: addressValidation,
});
export const addCustomerAddressValidation = Joi.object({
  district: Joi.string().trim().required(),
  thana: Joi.string().trim().required(),
  addressLine: Joi.string().trim().required(),
  isDefault: Joi.boolean().optional(),
});
export const updateCustomerAddressValidation = Joi.object({
  district: Joi.string().trim(),
  thana: Joi.string().trim(),
  addressLine: Joi.string().trim(),
  isDefault: Joi.boolean(),
}).min(1);
