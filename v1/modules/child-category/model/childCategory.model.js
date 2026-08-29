import mongoose from "mongoose";

const { Schema } = mongoose;
const localizedStringField = {
  type: Map,
  of: String,
  default: {},
};

const childCategorySchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: [true, "SubCategory is required"],
    },
    type: {
      type: String,
      required: true,
      enum: "Child",
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
childCategorySchema.index({ subCategoryId: 1 });
childCategorySchema.index({ tenantId: 1, status: 1 });
childCategorySchema.index({ tenantId: 1, subCategoryId: 1, status: 1 });
childCategorySchema.index({ createdAt: -1 });
childCategorySchema.index({ updatedAt: -1 });

const ChildCategory =
  mongoose.models.ChildCategory ||
  mongoose.model("ChildCategory", childCategorySchema);

export default ChildCategory;
