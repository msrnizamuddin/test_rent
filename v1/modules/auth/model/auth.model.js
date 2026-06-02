import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
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
      enum: ["active", "inactive"],
      default: "active",
    },
    domain: {
      type: String,
      trim: true,
    },
    clientLoginToken: {
      type: String,
    },
    tokenExpiration: {
      type: Date,
    },
    supportedLanguages: {
      type: [String],
      default: [],
    },
    supportedCurrency: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth",
    },
    verificationToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

authSchema.index({ tenantId: 1, email: 1 }, { unique: true });

authSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

authSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

export default mongoose.model("auth", authSchema);
