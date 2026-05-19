const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth",
      required: true,
    },

    accountNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    accountType: {
      type: String,
      enum: ["savings", "current", "business"],
      default: "savings",
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "BDT",
    },

    status: {
      type: String,
      enum: ["active", "suspended", "closed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Account", accountSchema);