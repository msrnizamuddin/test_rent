import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const authSchema = new mongoose.Schema(
  {
    // identity
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },

    userType: {
      type: String,
      enum: ["superadmin", "tenant"],
      default: "tenant",
    },

    // login credentials
    emailOrPhone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    // central control
    centralStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // other information
    supportedLanguages: {
      type: [String],
      default: [],
    },

    supportedCurrency: {
      type: [String],
      default: [],
    },

    // audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
    },

    // security
    verificationToken: {
      type: String,
      select: false,
    },

    clientLoginToken: {
      type: String,
      select: false,
    },

    tokenExpiration: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Same tenant-এর মধ্যে email/phone unique
authSchema.index({ tenantId: 1, emailOrPhone: 1 }, { unique: true });

// Password verification helper
authSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

export default mongoose.model("Auth", authSchema);
