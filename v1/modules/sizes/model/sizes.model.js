import mongoose from "mongoose";
const { Schema } = mongoose;
const localizedStringField = {
  type: Map,
  of: String,
  default: {},
};
const sizesSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant is required"],
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
    name: {
      ...localizedStringField,
      required: [true, "Name is required"],
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
  { timestamps: true, versionKey: false },
);

sizesSchema.index({ tenantId: 1, status: 1 });

sizesSchema.index({ tenantId: 1, centralStatus: 1 });

sizesSchema.index({ tenantId: 1, "name.$**": 1 });

export default mongoose.model("Sizes", sizesSchema);