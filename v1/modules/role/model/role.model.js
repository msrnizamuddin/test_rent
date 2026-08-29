import { model, Schema } from "mongoose";

const roleSchema = new Schema(
  {
    roleName: {
      type: String,
      required: [true, "Role name is required"],
      unique: [true, "Role name is already exists"],
      trim: true,
    }, // Admin, HR, Employee
    description: { type: String },
    permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
    centralStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true, versionKey: false },
);

// ---- Indexes ----

roleSchema.index({ currentStatus: 1 });

roleSchema.index({ permissions: 1 });

roleSchema.index({ currentStatus: 1, createdAt: -1 });

const Role = model("Role", roleSchema);

export default Role;