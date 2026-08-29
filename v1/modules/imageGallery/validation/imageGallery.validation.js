import mongoose from "mongoose";
import Joi from "joi";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("Invalid ObjectId");
  }

  return value;
};

export const createImageGalleryValidation = Joi.object({
  tenantId: Joi.string().custom(objectId).required(),
  centralStatus: Joi.string().valid("active", "inactive").default("active"),
  status: Joi.string().valid("active", "inactive").default("active"),
  imageUrl: Joi.string().trim().required(),
  imagePublicId: Joi.string().trim().required(),
  createdBy: Joi.string().custom(objectId).optional(),
  updatedBy: Joi.string().custom(objectId).optional(),
});

export const updateImageGalleryValidation = Joi.object({
  tenantId: Joi.string().custom(objectId),
  centralStatus: Joi.string().valid("active", "inactive"),
  status: Joi.string().valid("active", "inactive"),
  imageUrl: Joi.string().trim(),
  imagePublicId: Joi.string().trim(),
  updatedBy: Joi.string().custom(objectId),
}).min(1);
