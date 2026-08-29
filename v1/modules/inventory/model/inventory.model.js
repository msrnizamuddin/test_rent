import mongoose from "mongoose";
import { logModule } from "../../../utils/moduleLogger.js";
import { type } from "os";
logModule(import.meta.url);
const { Schema } = mongoose;

// main inventory schema
const inventorySchema = new Schema(
  {
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    sizeId: {
      type: Schema.Types.ObjectId,
      ref: "Sizes",
      required: true,
    },
    color: {
      type: String,
      trim: true,
    },
    colorImage: {
      type: String,
    },
    sku: {
      type: String,
      trim: true,
    },
    productPurchasePrice: {
      type: Number,
      min: 1,
    },
    basePrice: {
      type: Number,
      min: 1,
    },
    productOpeningStock: {
      type: Number,
      min: 0,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  },
);

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;
