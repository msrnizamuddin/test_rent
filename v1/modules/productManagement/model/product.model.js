import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: [true, "Slug already exists"],
      lowercase: true,
    },
    description: { type: String, trim: true },
    shortDesc: { type: String, maxlength: 500 },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },
    currency: { type: String, default: "BDT", uppercase: true },

    sku: {
      type: String,
      unique: [true, "SKU already exists"],
      required: [true, "Product SKU is required"],
    },
    stock: { type: Number, default: 0, min: 0 },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },

    images: [String],
    thumbnail: { type: String },
    variantType: {
      type: String,
      enum: ["singlevariant", "multivariant"],
      required: [true, "variant type is required"],
      trim: true,
      default: "singlevariant",
    },
    variants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant",
      },
    ],

    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true, versionKey: false },
);

export const Product = mongoose.model("Product", productSchema);
