import mongoose from "mongoose";
const { Schema, model, ObjectId } = mongoose;
const localizedStringField = {
  type: Map,
  of: String,
  default: {},
};
const brandSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant is required"],
    },
    centralStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    name: {
      ...localizedStringField,
      required: [true, "Name is required"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      trim: true,
      unique: [true, "Slug must be unique"],
      lowercase: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// ==================== INDEXES ====================
brandSchema.index({ "name.$**": 1 });
brandSchema.index({ tenantId: 1, status: 1 }); // combined filter (most common query pattern)
brandSchema.index({ createdAt: -1 }); // default sort
const Brands = mongoose.models.Brands || mongoose.model("Brands", brandSchema);
export default Brands;
