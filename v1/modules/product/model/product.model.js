import mongoose from "mongoose";
const { Schema } = mongoose;
const localizedStringField = {
  type: Map,
  of: String,
  default: {},
};
const productSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "Tenant",
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
      ...localizedStringField,
      required: true,
    },
    productSlug: {
      type: String,
      required: true,
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
      ...localizedStringField,
    },
    productShortDescription: {
      ...localizedStringField,
    },
    productCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    productSubCategory: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    productChildCategory: {
      type: Schema.Types.ObjectId,
      ref: "ChildCategory",
    },
    productBrand: {
      type: Schema.Types.ObjectId,
      ref: "Brands",
    },
    productFeatures: {
      type: Array,
      default: [],
    },
    productOrderQuantity: {
      type: Number,
      default: 0,
    },
    productYoutubeURL: {
      type: String,
    },
    productHowToCare: {
      ...localizedStringField,
    },
    deliveryInstructions: {
      ...localizedStringField,
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
  { timestamps: true },
);
productSchema.index(
  {
    tenantId: 1,
    productSlug: 1,
  },
  {
    unique: true,
  },
);
productSchema.virtual("inventoryItems", {
  ref: "Inventory",
  localField: "_id",
  foreignField: "productId",
});
productSchema.set("toJSON", {
  virtuals: true,
});

productSchema.set("toObject", {
  virtuals: true,
});
const Product = mongoose.model("Product", productSchema);
export default Product;
