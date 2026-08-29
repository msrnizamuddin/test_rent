import { model, Schema } from "mongoose";

const permissionSchema = new Schema(
  {
    permissionName: {
      type: String,
      required: [true, "permissionName is required"],
      unique: [true, "permissionName already exists"],
      trim: true,
    }, // e.g. "create_employee"
    module: { type: String, trim: true }, // Employee, Payroll, Attendance etc
    action: { type: String, enum: ["create", "read", "update", "delete"] },
    description: { type: String },
    centralStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true, versionKey: false },
);

// ---- Indexes ----

permissionSchema.index({ module: 1 });

permissionSchema.index({ action: 1 });

permissionSchema.index({ centralStatus: 1 });

permissionSchema.index({ module: 1, action: 1 });

permissionSchema.index({ module: 1, centralStatus: 1, createdAt: -1 });

const Permission = model("Permission", permissionSchema);

export default Permission;
