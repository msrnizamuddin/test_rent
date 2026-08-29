import mongoose from "mongoose";
import { logModule } from "../../../utils/moduleLogger.js";
import { type } from "os";
logModule(import.meta.url);
const { Schema } = mongoose;

const stockSchema = new Schema(
  {
    inventoryId: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
      index: true,
    },

    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
      index: true,
    },

    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    transactionType: {
      type: String,
      enum: [
        "OPENING",
        "PURCHASE",
        "RESERVE",
        "RELEASE",
        "SALE",
        "RETURN",
        "DAMAGE",
      ],
      required: true,
    },

    referenceType: {
      type: String,
      enum: ["PRODUCT", "ORDER", "PURCHASE", "RETURN", "MANUAL"],
    },

    referenceId: {
      type: Schema.Types.ObjectId,
    },

    remarks: String,

    createdBy: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  },
);
const Stock = mongoose.model("Stock", stockSchema);

export default Stock;
