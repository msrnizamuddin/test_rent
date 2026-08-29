import mongoose from "mongoose";
const { Schema } = mongoose;
const localizedStringField = {
  type: Map,
  of: String,
  default: {},
};

const warehouseSchema = new Schema(
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
    location: {
      type: String,
      trim: true,
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

warehouseSchema.index({ tenantId: 1, status: 1 });
warehouseSchema.index({ tenantId: 1, centralStatus: 1 });
warehouseSchema.index({ tenantId: 1, "name.$**": 1 });

const Warehouse = mongoose.model("Warehouse", warehouseSchema);
export default Warehouse;