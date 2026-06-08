import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid ObjectId");
  }

  return value;
};

export const createWarehouseValidation = Joi.object({
  tenantId: Joi.string().custom(objectId).required(),

  centralStatus: Joi.string()
    .valid("active", "inactive")
    .default("active"),

  name: Joi.string()
    .trim()
    .required(),
  status: Joi.string()
    .valid("active", "inactive")
    .default("active"),
  location: Joi.string()
    .trim()
    .allow("")
    .optional(),

  createdBy: Joi.string()
    .custom(objectId)
    .optional(),

  updatedBy: Joi.string()
    .custom(objectId)
    .optional(),
});

export const updateWarehouseValidation = Joi.object({
  tenantId: Joi.string().custom(objectId),

  centralStatus: Joi.string()
    .valid("active", "inactive"),

  status: Joi.string()
    .valid("active", "inactive"),
  
  name: Joi.string().trim(),

  location: Joi.string().trim(),

  updatedBy: Joi.string()
    .custom(objectId),
}).min(1);