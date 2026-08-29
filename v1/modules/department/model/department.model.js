import { Schema, model } from "mongoose";

const departmentSchema = new Schema(
  {
    departmentName: {
      type: String,
      required: [true, "Department name is required"],
      unique: [true, "Department name is already exists"],
      trim: true,
    }, // HR, IT, Sales etc
    departmentCode: {
      type: String,
      unique: [true, "Department code is already exists"],
      trim: true,
      uppercase: true,
    }, // DEP001
    description: { type: String },
    centralStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "Employee" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true, versionKey: false },
);

// ---- Indexes ----

departmentSchema.index({ status: 1 });

departmentSchema.index({ centralStatus: 1 });

departmentSchema.index({ createdBy: 1 });

departmentSchema.index({ status: 1, createdAt: -1 });

const Department = model("Department", departmentSchema);
export default Department;
