import Joi from "joi";
import { requiredMessage } from "../../../utils/joi-messages.js";

const objectId = Joi.string().guid({ version: "uuidv4" });

export const paymentIdParamValidation = Joi.object({
  paymentId: objectId.required().messages(requiredMessage("Payment id")),
});

export const tripIdParamValidation = Joi.object({
  tripId: objectId.required().messages(requiredMessage("Trip id")),
});

export const recordPaymentValidation = Joi.object({
  tripId: objectId.required().messages(requiredMessage("Trip id")),
  amount: Joi.number().positive().required().messages(requiredMessage("Amount")),
  paymentType: Joi.string().valid("advance", "full").required().messages(requiredMessage("Payment type")),
  method: Joi.string()
    .valid("cash", "online", "mobile_banking", "card")
    .required()
    .messages(requiredMessage("Payment method")),
  transactionId: Joi.string().trim().optional(),
  // Only honored for superadmin/manager recording a payment already received.
  status: Joi.string().valid("paid").optional(),
});

export const updatePaymentStatusValidation = Joi.object({
  status: Joi.string()
    .valid("pending", "partial", "paid", "failed", "refunded", "cancelled")
    .required()
    .messages(requiredMessage("Status")),
  transactionId: Joi.string().trim().optional(),
});

export const refundPaymentValidation = Joi.object({
  reason: Joi.string().trim().optional(),
});

export const listPaymentsValidation = Joi.object({
  status: Joi.string().valid("pending", "partial", "paid", "failed", "refunded", "cancelled").optional(),
  method: Joi.string().valid("cash", "online", "mobile_banking", "card").optional(),
  customerId: objectId.optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
