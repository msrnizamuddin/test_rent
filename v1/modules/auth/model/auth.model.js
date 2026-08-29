import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // ---------------- Role-based access ----------------
    role: {
      type: String,
      enum: ["superadmin", "manager", "driver", "customer"],
      required: true,
      default: "customer",
    },

    // Manager permission toggles (set by Super Admin, only used when role === "manager")
    permissions: {
      userManagement: { type: Boolean, default: false },
      vehicleManagement: { type: Boolean, default: false },
      driverManagement: { type: Boolean, default: false },
      bookingManagement: { type: Boolean, default: false },
      paymentManagement: { type: Boolean, default: false },
      reports: { type: Boolean, default: false },
      settings: { type: Boolean, default: false },
    },

    // ---------------- 1.1 Registration ----------------
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    address: {
      presentAddress: { type: String, trim: true },
      permanentAddress: { type: String, trim: true },
      city: { type: String, trim: true },
      district: { type: String, trim: true },
      postCode: { type: String, trim: true },
      country: { type: String, trim: true, default: "Bangladesh" },
    },

    // NID / Passport — required for customer & driver
    identification: {
      type: {
        type: String,
        enum: ["nid", "passport"],
      },
      number: { type: String, trim: true },
      frontImage: { type: String },
      backImage: { type: String },
      expiryDate: { type: Date }, // relevant for passport
    },

    // Driving License — required for driver, optional for customer (self-drive rentals)
    drivingLicense: {
      number: { type: String, trim: true },
      issueDate: { type: Date },
      expiryDate: { type: Date },
      frontImage: { type: String },
      backImage: { type: String },
    },

    profilePicture: {
      type: String, // URL / path
    },

    documents: [
      {
        title: { type: String, trim: true },
        fileUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },

    // ---------------- 1.2 Authentication ----------------
    centralStatus: {
      type: String,
      enum: ["active", "inactive", "suspended", "blocked"],
      default: "active",
    },

    isActivated: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
    },

    // Driver-specific operational status (used only when role === "driver")
    driverStatus: {
      type: String,
      enum: [
        "pending",
        "approved",
        "available",
        "assigned",
        "on-trip",
        "offline",
        "suspended",
        "inactive",
      ],
    },

    otp: {
      code: { type: String, select: false },
      purpose: {
        type: String,
        enum: ["registration", "login", "reset-password", "change-mobile"],
        select: false,
      },
      expiresAt: { type: Date, select: false },
    },

    // security
    verificationToken: {
      type: String,
      select: false,
    },

    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
      select: false,
    },

    clientLoginToken: {
      type: String,
      select: false,
    },

    tokenExpiration: {
      type: Date,
    },

    // security & audit (module 30)
    failedLoginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    lastLoginIp: {
      type: String,
      select: false,
    },

    // audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Password verification helper
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

export default mongoose.model("User", userSchema);
