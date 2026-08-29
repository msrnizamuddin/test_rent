import { Schema, model } from "mongoose";

const designationSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Designation title is required"],
      trim: true,
    }, // Manager, Developer, HR etc
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    description: { type: String },
    centralStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "Auth" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Auth" },
  },
  { timestamps: true, versionKey: false },
);

// ---- Indexes ----

designationSchema.index({ centralStatus: 1 });

designationSchema.index({ createdBy: 1 });

designationSchema.index({ department: 1, centralStatus: 1, createdAt: -1 });

const Designation = model("Designation", designationSchema);
export default Designation;
