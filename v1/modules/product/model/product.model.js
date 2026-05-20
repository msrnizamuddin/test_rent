import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant", 
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true, 
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", 
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    unit: {
      type: String, 
      required: true,
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true, 
    },
    images: [
      {
        type: String, 
      }
    ],
    thumbnail: {
      type: String, 
    },
    pricing: {
      purchasePrice: {
        type: Number,
        required: true,
        min: 0,
      },
      retailPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      wholesalePrice: {
        type: Number,
        required: true,
        min: 0,
      },
      dealerPrice: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;