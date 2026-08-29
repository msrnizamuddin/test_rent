import Joi from "joi";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
const localizedStringSchema = Joi.object({
  en: Joi.string().trim(),
  bn: Joi.string().trim(),
  ar: Joi.string().trim(),
}).min(1);
// Custom ObjectId Validator
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};
// Inventory Item Schema
const inventoryItemSchema = Joi.object({
  warehouseId: Joi.string().custom(objectId).required(),
  sizeId: Joi.string().custom(objectId).required(),
  sku: Joi.string().trim().required(),
  color: Joi.string().trim().optional(),
  basePrice: Joi.number().min(1).required(),
  productPurchasePrice: Joi.number().min(0).required(),
  productOpeningStock: Joi.number().min(0).default(0),
});

export const createProductValidation = Joi.object({
  tenantId: Joi.string()
    .guid({ version: ["uuidv4"] })
    .required(),
  productName: localizedStringSchema.required(),
  productSlug: Joi.string().trim().required(),
  productImage: Joi.string().uri().optional(),
  productGallery: Joi.array().items(Joi.string().uri()).default([]),
  productStyle: Joi.array().default([]),
  productFeaturesStatus: Joi.string()
    .valid("active", "inactive")
    .default("active"),
  productDescription: localizedStringSchema.optional(),
  productShortDescription: localizedStringSchema.optional(),
  productCategory: Joi.string().custom(objectId).optional(),
  productSubCategory: Joi.string().custom(objectId).optional(),
  productChildCategory: Joi.string().custom(objectId).optional(),
  productBrand: Joi.string().custom(objectId).optional(),
  productFeatures: Joi.array().default([]),
  productOrderQuantity: Joi.number().min(0).default(0),
  productYoutubeURL: Joi.string().uri().optional(),
  productHowToCare: localizedStringSchema.optional(),
  deliveryInstructions: localizedStringSchema.optional(),
  seoKeywords: Joi.array().items(Joi.string().trim()).optional(),
  metaTitle: Joi.string().optional(),
  metaDescription: Joi.string().optional(),
  productTags: Joi.array().items(Joi.string().trim()).optional(),
  status: Joi.string().valid("active", "inactive").default("active"),
  inventories: Joi.array().items(inventoryItemSchema).min(1).required(),
});

export const updateProductValidation = Joi.object({
  productName: localizedStringSchema.optional(),
  productSlug: Joi.string().trim().optional(),
  productImage: Joi.string().uri().optional(),
  productGallery: Joi.array().items(Joi.string().uri()).optional(),
  productStyle: Joi.array().optional(),
  productFeaturesStatus: Joi.string().valid("active", "inactive").optional(),
  productDescription: localizedStringSchema.optional(),
  productShortDescription: localizedStringSchema.optional(),
  productCategory: Joi.string().custom(objectId).optional(),
  productSubCategory: Joi.string().custom(objectId).optional(),
  productChildCategory: Joi.string().custom(objectId).optional(),
  productBrand: Joi.string().custom(objectId).optional(),
  productFeatures: Joi.array().optional(),
  productOrderQuantity: Joi.number().min(0).optional(),
  productYoutubeURL: Joi.string().uri().optional(),
  productHowToCare: localizedStringSchema.optional(),
  deliveryInstructions: localizedStringSchema.optional(),
  seoKeywords: Joi.array().items(Joi.string().trim()).optional(),
  metaTitle: Joi.string().optional(),
  metaDescription: Joi.string().optional(),
  productTags: Joi.array().items(Joi.string().trim()).optional(),
  status: Joi.string().valid("active", "inactive").optional(),
}).or(
  "productName",
  "productSlug",
  "productImage",
  "productGallery",
  "productStyle",
  "productFeaturesStatus",
  "productDescription",
  "productShortDescription",
  "productCategory",
  "productSubCategory",
  "productChildCategory",
  "productBrand",
  "productFeatures",
  "productOrderQuantity",
  "productYoutubeURL",
  "productHowToCare",
  "deliveryInstructions",
  "seoKeywords",
  "metaTitle",
  "metaDescription",
  "productTags",
  "status",
);
