import mongoose from "mongoose";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);

const { Schema } = mongoose;
const tenantOrderSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    tenantName: {
      type: String,
      required: true,
    },
    items: [
      {
        productId: Schema.Types.ObjectId,
        inventoryId: Schema.Types.ObjectId,
        productName: String,
        productImage: String,
        quantity: Number,
      },
    ],
    tenantStatus: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "processing",
        "ready",
        "picked_up",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    remarks: String,
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);
const guestInfoSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);
const pricingSchema = new Schema(
  {
    subTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    couponCode: {
      type: String,
      trim: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    deliveryState: {
      type: String,
      trim: true,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false },
);
const addressSchema = new Schema(
  {
    district: {
      type: String,
      trim: true,
    },
    thana: {
      type: String,
      trim: true,
    },
    addressLine: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);
const orderItemSchema = new Schema(
  {
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
    tenantName: {
      type: String,
      required: true,
      trim: true,
    },
    inventoryId: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productSlug: {
      type: String,
      trim: true,
    },
    productImage: {
      type: String,
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
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);
const statusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    orderType: {
      type: String,
      enum: ["GUEST", "REGISTERED"],
      required: true,
    },
    tenantOrders: {
      type: [tenantOrderSchema],
      default: [],
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      index: true,
      required: function () {
        return this.orderType === "REGISTERED";
      },
    },
    orderDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    guestInfo: guestInfoSchema,
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    billingAddress: {
      type: addressSchema,
    },
    shippingAddress: {
      type: addressSchema,
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },
    pricing: {
      type: pricingSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "gateway"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    isCentral: {
      type: Boolean,
      default: false,
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
  },
);

orderSchema.pre("save", function () {
  this.fullName = `${this.firstName} ${this.lastName}`.trim();
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
