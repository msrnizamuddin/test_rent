import Joi from "joi";

const objectId = Joi.string().guid({ version: "uuidv4" });

export const paymentIdParamValidation = Joi.object({
  paymentId: objectId.required(),
});

export const tripIdParamValidation = Joi.object({
  tripId: objectId.required(),
});

export const recordPaymentValidation = Joi.object({
  tripId: objectId.required(),
  amount: Joi.number().positive().required(),
  paymentType: Joi.string().valid("advance", "full").required(),
  method: Joi.string().valid("cash", "online", "mobile_banking", "card").required(),
  transactionId: Joi.string().trim().optional(),
  // Only honored for superadmin/manager recording a payment already received.
  status: Joi.string().valid("paid").optional(),
});

export const updatePaymentStatusValidation = Joi.object({
  status: Joi.string()
    .valid("pending", "partial", "paid", "failed", "refunded", "cancelled")
    .required(),
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
