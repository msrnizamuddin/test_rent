import Joi from "joi";
import mongoose from "mongoose";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("invalid objectId");
  }

  return value;
};

export const createInventoryValidation = Joi.object({
  warehouseId: Joi.string().hex().length(24).required(),
  sizeId: Joi.string().hex().length(24).required(),
  color: Joi.string().trim(),
  colorImage: Joi.string().uri(),
  sku: Joi.string().trim(),
  productPurchasePrice: Joi.number().min(1),
  basePrice: Joi.number().min(1),
  productOpeningStock: Joi.number().min(1).default(1),
  createdBy: Joi.string().hex().length(24),
  updatedBy: Joi.string().hex().length(24),
});

export const updateInventoryValidation = Joi.object({
  warehouseId: Joi.string().hex().length(24),
  sizeId: Joi.string().hex().length(24),
  color: Joi.string().trim(),
  colorImage: Joi.string().uri(),
  sku: Joi.string().trim(),
  productPurchasePrice: Joi.number().min(1),
  basePrice: Joi.number().min(1),
  productOpeningStock: Joi.number().min(1),

  createdBy: Joi.string().hex().length(24),
  updatedBy: Joi.string().hex().length(24),
}).min(1);

// Validation for DELETE route params
export const deleteInventoryValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
});
