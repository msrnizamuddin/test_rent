import Joi from "joi";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const createAccountHeadValidation = Joi.object({
  tenantId: Joi.string()
    .guid({ version: ["uuidv4"] })
    .required(),

  centralStatus: Joi.string().valid("active", "inactive").default("active"),

  status: Joi.string().valid("active", "inactive").default("active"),

  accountName: Joi.string().trim().min(2).max(100).required(),

  accountCode: Joi.string().trim().uppercase().min(2).max(30).required(),

  headType: Joi.string()
    .valid("ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE")
    .required(),

  accountType: Joi.string().trim().min(2).max(100).required(),

  parentAccount: Joi.string().custom(objectId).allow(null, ""),

  balanceNature: Joi.string().valid("DEBIT", "CREDIT").required(),

  isSystemHead: Joi.boolean().default(false),

  allowTransaction: Joi.boolean().default(true),

  description: Joi.string().trim().max(500).allow("", null),

  createdBy: Joi.string().custom(objectId).allow(null),

  updatedBy: Joi.string().custom(objectId).allow(null),
});
export const updateAccountHeadValidation = Joi.object({
  accountName: Joi.string().trim().max(100),

  accountCode: Joi.string().trim().max(50),

  headType: Joi.string().valid(
    "ASSET",
    "LIABILITY",
    "EQUITY",
    "INCOME",
    "EXPENSE",
  ),

  accountType: Joi.string().trim().max(100),

  parentAccount: Joi.string().custom(objectId).allow(null, ""),

  balanceNature: Joi.string().valid("DEBIT", "CREDIT"),

  allowTransaction: Joi.boolean(),

  description: Joi.string().trim().max(500).allow("", null),

  status: Joi.string().valid("active", "inactive"),

  centralStatus: Joi.string().valid("active", "inactive"),

  updatedBy: Joi.string().custom(objectId).allow(null),
}).min(1);
