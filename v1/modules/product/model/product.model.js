import mongoose from "mongoose";
import "../../brand/model/brand.model.js";
import "../../category/model/category.model.js";

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    centralStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    productName: {
      type: Object,
      required: true,
    },
    productSlug: {
      type: String,
      required: true,
      unique: true,
    },
    productImage: {
      type: String,
    },
    productGallery: {
      type: [String],
      default: [],
    },
    productStyle: {
      type: Array,
      default: [],
    },
    productFeaturesStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    productDescription: {
      type: String,
    },
    productShortDescription: {
      type: String,
    },
    productCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    productSubCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    productChildCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    productBrand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
    },
    productFeatures: {
      type: Array,
      default: [],
    },
    productOrderQuantity: {
      type: Number,
      default: 0,
    },
    productYoutueURL: {
      type: String,
    },
    productHowToCare: {
      type: String,
    },
    deliveryInstructions: {
      type: String,
    },
    inventoryItems: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
    },
    seoKeywords: {
      type: [String],
      default: [],
    },
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    productTags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;