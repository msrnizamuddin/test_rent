import Joi from "joi";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const invoiceItemSchema = Joi.object({
  productId: Joi.string().custom(objectId).required(),

  inventoryId: Joi.string().custom(objectId).required(),

  quantity: Joi.number().integer().min(1).required(),

  unitPrice: Joi.number().min(0).required(),

  discount: Joi.number().min(0).default(0),

  tax: Joi.number().min(0).default(0),

  total: Joi.number().min(0).required(),
});

const paymentSchema = Joi.object({
  amount: Joi.number().min(0).required(),

  accountHeadId: Joi.string().custom(objectId).required(),

  paymentDate: Joi.date().default(Date.now),

  note: Joi.string().trim().allow("", null),
});

export const createPurchaseInvoiceValidation = Joi.object({
  accountTransactionId: Joi.string().custom(objectId).allow(null, ""),

  tenantId: Joi.string()
    .guid({ version: ["uuidv4"] })
    .required(),

  invoiceNumber: Joi.string().trim().max(50).required(),

  referenceNumber: Joi.string().trim().max(100).allow("", null),

  invoiceItems: Joi.array().items(invoiceItemSchema).min(1).required(),

  invoiceDate: Joi.date().required(),

  subTotal: Joi.number().min(0).required(),

  discountAmount: Joi.number().min(0).default(0),

  taxAmount: Joi.number().min(0).default(0),

  grandTotal: Joi.number().min(0).required(),

  invoiceNote: Joi.string().trim().allow("", null),

  payments: Joi.array().items(paymentSchema).default([]),

  paymentStatus: Joi.string()
    .valid("UNPAID", "PARTIAL", "PAID")
    .default("UNPAID"),

  createdBy: Joi.string().custom(objectId).allow(null),
}).custom((invoice, helpers) => {
  // Validate each invoice item

  for (const item of invoice.invoiceItems) {
    const expected = item.quantity * item.unitPrice - item.discount + item.tax;

    if (Math.abs(expected - item.total) > 0.01) {
      return helpers.message("Invoice item total is incorrect.");
    }
  }

  // subtotal

  const subTotal = invoice.invoiceItems.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  if (Math.abs(subTotal - invoice.subTotal) > 0.01) {
    return helpers.message("Subtotal is incorrect.");
  }

  // grand total

  const grandTotal =
    invoice.subTotal - invoice.discountAmount + invoice.taxAmount;

  if (Math.abs(grandTotal - invoice.grandTotal) > 0.01) {
    return helpers.message("Grand total is incorrect.");
  }

  // payments

  const paidAmount = invoice.payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  if (paidAmount > invoice.grandTotal) {
    return helpers.message("Payment exceeds grand total.");
  }

  // payment status

  if (paidAmount === 0 && invoice.paymentStatus !== "UNPAID") {
    return helpers.message("Payment status should be UNPAID.");
  }

  if (
    paidAmount > 0 &&
    paidAmount < invoice.grandTotal &&
    invoice.paymentStatus !== "PARTIAL"
  ) {
    return helpers.message("Payment status should be PARTIAL.");
  }

  if (paidAmount === invoice.grandTotal && invoice.paymentStatus !== "PAID") {
    return helpers.message("Payment status should be PAID.");
  }

  return invoice;
});
