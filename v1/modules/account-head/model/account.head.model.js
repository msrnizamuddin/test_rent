import mongoose from "mongoose";

const { Schema } = mongoose;

const accountHeadSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
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

    accountName: {
      type: String,
      required: true,
      trim: true,
    },

    accountCode: {
      type: String,
      required: true,
      trim: true,
    },

    headType: {
      type: String,
      required: true,
      enum: ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"],
    },

    accountType: {
      type: String,
      required: true,
      trim: true,
    },

    parentAccount: {
      type: Schema.Types.ObjectId,
      ref: "AccountHead",
      default: null,
    },

    balanceNature: {
      type: String,
      enum: ["DEBIT", "CREDIT"],
      required: true,
    },

    isSystemHead: {
      type: Boolean,
      default: false,
    },

    allowTransaction: {
      type: Boolean,
      default: true,
    },

    description: {
      type: String,
      trim: true,
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

accountHeadSchema.index(
  {
    tenantId: 1,
    accountCode: 1,
  },
  {
    unique: true,
  },
);

const AccountHead = mongoose.model("AccountHead", accountHeadSchema);

export default AccountHead;
