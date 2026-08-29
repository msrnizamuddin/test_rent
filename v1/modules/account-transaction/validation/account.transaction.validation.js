import Joi from "joi";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};
const transactionLineSchema = Joi.object({
  accountHeadId: Joi.string().custom(objectId).required(),
  txType: Joi.string().valid("DEBIT", "CREDIT").required(),
  amount: Joi.number().min(0).required(),
  remarks: Joi.string().trim().max(500).allow("", null),
});
export const createAccountTransactionValidation = Joi.object({
  tenantId: Joi.string()
    .guid({ version: ["uuidv4"] })
    .required(),
  voucherNumber: Joi.string().trim().max(50).required(),
  voucherType: Joi.string()
    .valid("JV", "PV", "RV", "SV", "PRV", "CV", "OB", "CN", "DN")
    .required(),
  transactionDate: Joi.date().required(),
  referenceNumber: Joi.string().trim().max(100).allow("", null),
  description: Joi.string().trim().max(500).allow("", null),
  entries: Joi.array().items(transactionLineSchema).min(2).required(),
  totalDebit: Joi.number().min(0).optional(),
  totalCredit: Joi.number().min(0).optional(),
  sourceModule: Joi.string()
    .valid(
      "SALES",
      "PURCHASE",
      "PAYMENT",
      "RECEIPT",
      "JOURNAL",
      "POS",
      "OPENING_BALANCE",
    )
    .allow("", null),
  referenceId: Joi.string().custom(objectId).allow(null, ""),
  status: Joi.string()
    .valid("PENDING", "POSTED", "CANCELLED")
    .default("POSTED"),
  createdBy: Joi.string().custom(objectId).allow(null),
  updatedBy: Joi.string().custom(objectId).allow(null),
}).custom((value, helpers) => {
  const totalDebit = value.entries
    .filter((entry) => entry.txType === "DEBIT")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const totalCredit = value.entries
    .filter((entry) => entry.txType === "CREDIT")
    .reduce((sum, entry) => sum + entry.amount, 0);
  if (totalDebit !== totalCredit) {
    return helpers.message("Total debit and total credit must be equal.");
  }
  return value;
});
