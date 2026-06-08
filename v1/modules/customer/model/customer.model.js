import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const addressSchema = new mongoose.Schema(
  {
    addressLine1: {
      type: String,
      trim: true,
    },

    addressLine2: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    postalCode: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
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

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    profilePicture: {
      type: String,
      default: null,
    },

    billingAddress: addressSchema,

    shippingAddress: addressSchema,

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
  }
);

customerSchema.pre("save", function (next) {
  this.fullName = `${this.firstName} ${this.lastName}`.trim();
  next();
});

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;