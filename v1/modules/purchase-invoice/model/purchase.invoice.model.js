import mongoose from "mongoose";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);

const { Schema } = mongoose;

const purchaseInvoiceItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    inventoryId: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const paymentSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    accountHeadId: {
      type: Schema.Types.ObjectId,
      ref: "AccountHead",
      required: true,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    note: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const purchaseInvoiceSchema = new Schema(
  {
    accountTransactionId: {
      type: Schema.Types.ObjectId,
      ref: "AccountTransaction",
    },
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },

    referenceNumber: {
      type: String,
      trim: true,
    },

    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    invoiceItems: {
      type: [purchaseInvoiceItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Invoice must contain at least one item.",
      },
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    invoiceNote: {
      type: String,
      trim: true,
    },

    payments: {
      type: [paymentSchema],
      default: [],
    },

    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PARTIAL", "PAID"],
      default: "UNPAID",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);
purchaseInvoiceSchema.index(
  {
    tenantId: 1,
    invoiceNumber: 1,
  },
  {
    unique: true,
  },
);
const PurchaseInvoice = mongoose.model(
  "PurchaseInvoice",
  purchaseInvoiceSchema,
);

export default PurchaseInvoice;
