import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
const { Schema } = mongoose;
const addressSchema = new mongoose.Schema(
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
const savedAddressSchema = new mongoose.Schema(
  {
    district: {
      type: String,
      trim: true,
      required: true,
    },
    thana: {
      type: String,
      trim: true,
      required: true,
    },
    addressLine: {
      type: String,
      trim: true,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
    timestamps: true,
  },
);
const customerSchema = new mongoose.Schema(
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
    fullName: {
      type: String,
      trim: true,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: function () {
        return !this.isGuest;
      },
    },
    profilePicture: {
      type: String,
      default: null,
    },
    billingAddress: addressSchema,
    shippingAddress: addressSchema,
    addresses: {
      type: [savedAddressSchema],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    tenantId: {
      type: String,
      index: true,
      required: true,
      default: uuidv4,
      immutable: true,
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
  },
  {
    timestamps: true,
  },
);
customerSchema.pre("save", function () {
  this.fullName = `${this.firstName} ${this.lastName}`.trim();
});
const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
