import mongoose from "mongoose";

const { Schema } = mongoose;
const localizedStringField = {
  type: Map,
  of: String,
  default: {},
};

const categorySchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant is required"],
    },
    type: {
      type: String,
      required: true,
      enum: "Parent",
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
    name: {
      ...localizedStringField,
      required: [true, "Name is required"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: [true, "Slug must be unique"],
      trim: true,
      lowercase: true,
    },
    profileImage: {
      type: String,
    },
    coverImage: {
      type: String,
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
categorySchema.index({ tenantId: 1, status: 1 }); // most common filter combination
categorySchema.index({ createdAt: -1 }); // default sort

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;
