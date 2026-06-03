import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const tenantSchema = new mongoose.Schema(
  {
    // identity
    tenantId: {
      type: String,
      unique: true,
      required: true,
      default: uuidv4,
      immutable: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    // business information
    businessName: {
      type: String,
      trim: true,
    },

    businessEmail: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    businessPhone: {
      type: String,
      trim: true,
    },

    businessWebsite: {
      type: String,
      trim: true,
    },

    businessAddress: {
      type: String,
      trim: true,
    },

    contactPageEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },

    // central control
    centralStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // branding
    logo: String,
    favicon: String,
    invoiceLogo: String,

    // social media
    socialMediaLinks: [
      {
        platform: String,
        url: String,
      },
    ],

    // banking information
    bankDetails: [
      {
        bankName: String,
        accountName: String,
        accountNumber: String,
        branchName: String,
        routingNumber: String,
      },
    ],

    // website & invoice settings
    invoiceFooterNotes: String,
    websiteFooterNotes: String,

    // seo settings
    seoMetaTitle: String,
    seoMetaDescription: String,
    seoKeywords: [String],

    // client configuration
    clientType: [String],

    // audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model("Tenant", tenantSchema);
