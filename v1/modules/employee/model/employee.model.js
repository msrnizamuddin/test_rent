import { Schema, model } from "mongoose";

const employeeSchema = new Schema(
  {
    employeeId: {
      type: String,
      required: [true, "employeeId is required"],
      unique: [true, "employeeId already exists"],
    }, // EMP001
    name: { type: String, required: [true, "name is required"] },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email already exists"],
    },
    phone: { type: String, required: [true, "phone is required"] },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: { type: Date },
    address: { type: String },

    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    designationId: { type: Schema.Types.ObjectId, ref: "Designation" },
    roleId: { type: Schema.Types.ObjectId, ref: "Role" },

    joiningDate: { type: Date, default: Date.now },

    isSalary: { type: Boolean, default: true },
    isCommission: { type: Boolean, default: false },

    salaryAmount: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 0 },

    centralStatus: {
      type: String,
      enum: ["Active", "Inactive", "Terminated"],
      default: "Active",
    },
    profileImage: { type: String },

    createdBy: { type: Schema.Types.ObjectId, ref: "Auth" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Auth" },
  },
  { timestamps: true, versionKey: false },
);

const Employee = model("Employee", employeeSchema);
export default Employee;
