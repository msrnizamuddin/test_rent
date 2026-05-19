const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tenant",
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    role: {
      type: String,
      enum: ["Super Admin", "Tenant"],
      default: "Tenant",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    centralStatus: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("auth", authSchema);