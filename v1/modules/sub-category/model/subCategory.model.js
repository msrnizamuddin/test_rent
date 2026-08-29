import mongoose from "mongoose";

const { Schema } = mongoose;
const localizedStringField = {
  type: Map,
  of: String,
  default: {},
};

const subCategorySchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: "Sub",
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

subCategorySchema.index({ categoryId: 1 }); // categoryId diye filter/populate common
subCategorySchema.index({ tenantId: 1, status: 1 }); // most common filter combination
subCategorySchema.index({ tenantId: 1, categoryId: 1, status: 1 }); // combined filter (list by category)
subCategorySchema.index({ createdAt: -1 }); // default sort
subCategorySchema.index({ updatedAt: -1 }); // updatedAt diye sort hole
subCategorySchema.index({ "name.$**": 1 }); // Map field er vitorer key-value search er jonno

const SubCategory =
  mongoose.models.SubCategory ||
  mongoose.model("SubCategory", subCategorySchema);

export default SubCategory;
