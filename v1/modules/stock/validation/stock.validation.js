import Joi from "joi";
import mongoose from "mongoose";
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const createStockValidation = Joi.object({
  inventoryId: Joi.string().custom(objectId).required(),
  productId: Joi.string().custom(objectId).required(),
  warehouseId: Joi.string().custom(objectId).required(),
  tenantId: Joi.string()
    .guid({ version: ["uuidv4"] })
    .required(),
  quantity: Joi.number().min(1).required(),
  transactionType: Joi.string()
    .valid(
      "OPENING",
      "PURCHASE",
      "RESERVE",
      "RELEASE",
      "SALE",
      "RETURN",
      "DAMAGE",
    )
    .required(),
  referenceType: Joi.string()
    .valid("PRODUCT", "ORDER", "PURCHASE", "RETURN", "MANUAL")
    .required(),
  referenceId: Joi.when("referenceType", {
    is: Joi.exist(),
    then: Joi.string().custom(objectId).required(),
    otherwise: Joi.optional(),
  }),
  remarks: Joi.string().trim().allow("").optional(),
});
//possibly not needed.
export const updateStockValidation = Joi.object({
  quantity: Joi.number().min(1).optional(),
  transactionType: Joi.string()
    .valid(
      "OPENING",
      "PURCHASE",
      "RESERVE",
      "RELEASE",
      "SALE",
      "RETURN",
      "DAMAGE",
    )
    .optional(),
  referenceType: Joi.string()
    .valid("PRODUCT", "ORDER", "PURCHASE", "RETURN", "MANUAL")
    .optional(),
  referenceId: Joi.string().custom(objectId).optional(),
  remarks: Joi.string().trim().allow("").optional(),
}).min(1);
