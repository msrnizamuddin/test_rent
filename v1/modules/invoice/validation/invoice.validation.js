import Joi from "joi";

const objectId = Joi.string().guid({ version: "uuidv4" });

export const invoiceIdParamValidation = Joi.object({
  invoiceId: objectId.required(),
});

export const tripIdParamValidation = Joi.object({
  tripId: objectId.required(),
});

export const generateInvoiceValidation = Joi.object({
  tripId: objectId.required(),
  rentalCharge: Joi.number().min(0).default(0),
  driverCharge: Joi.number().min(0).default(0),
  additionalCharges: Joi.number().min(0).default(0),
  tax: Joi.number().min(0).default(0),
  discount: Joi.number().min(0).default(0),
});

export const listInvoicesValidation = Joi.object({
  paymentStatus: Joi.string()
    .valid("pending", "partial", "paid", "failed", "refunded", "cancelled")
    .optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
