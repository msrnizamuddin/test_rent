import Joi from "joi";
import mongoose from "mongoose";

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("invalid objectId");
  }
  return value;
};

const emailOrPhone = Joi.alternatives().try(
  Joi.string().email(),
  Joi.string()
    .length(11)
    .pattern(/^01[3-9]\d{8}$/),
);

const addressSchema = Joi.object({
  presentAddress: Joi.string().trim().allow(""),
  permanentAddress: Joi.string().trim().allow(""),
  city: Joi.string().trim().allow(""),
  district: Joi.string().trim().allow(""),
  postCode: Joi.string().trim().allow(""),
  country: Joi.string().trim(),
});

const identificationSchema = Joi.object({
  type: Joi.string().valid("nid", "passport").required(),
  number: Joi.string().trim().required(),
  frontImage: Joi.string().uri().optional(),
  backImage: Joi.string().uri().optional(),
  expiryDate: Joi.date().optional(),
});

const drivingLicenseSchema = Joi.object({
  number: Joi.string().trim().required(),
  issueDate: Joi.date().optional(),
  expiryDate: Joi.date().optional(),
  frontImage: Joi.string().uri().optional(),
  backImage: Joi.string().uri().optional(),
});

const permissionsSchema = Joi.object({
  userManagement: Joi.boolean(),
  vehicleManagement: Joi.boolean(),
  driverManagement: Joi.boolean(),
  bookingManagement: Joi.boolean(),
  paymentManagement: Joi.boolean(),
  reports: Joi.boolean(),
  settings: Joi.boolean(),
});

// ---------------- 1.1 User Registration ----------------
// Public self-signup: always role "customer". Super Admin creates manager/driver
// accounts separately via createStaffValidation below.
export const signupValidation = Joi.object({
  fullName: Joi.string().trim().required(),
  mobileNumber: Joi.string()
    .length(11)
    .pattern(/^01[3-9]\d{8}$/)
    .required(),
  email: Joi.string().email().optional(),

  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "confirmPassword must match password" }),

  address: addressSchema.optional(),

  identification: identificationSchema.optional(),
  drivingLicense: drivingLicenseSchema.optional(),

  profilePicture: Joi.string().uri().optional(),

  documents: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().trim().required(),
        fileUrl: Joi.string().uri().required(),
      }),
    )
    .optional(),
});

// Super Admin creating a Manager, Driver, or another Super Admin account
export const createStaffValidation = Joi.object({
  role: Joi.string().valid("superadmin", "manager", "driver").required(),

  fullName: Joi.string().trim().required(),
  mobileNumber: Joi.string()
    .length(11)
    .pattern(/^01[3-9]\d{8}$/)
    .required(),
  email: Joi.string().email().optional(),

  password: Joi.string().min(8).required(),

  address: addressSchema.optional(),
  identification: identificationSchema.optional(),

  // required when role === "driver"
  drivingLicense: Joi.when("role", {
    is: "driver",
    then: drivingLicenseSchema.required(),
    otherwise: drivingLicenseSchema.optional(),
  }),

  profilePicture: Joi.string().uri().optional(),

  // only relevant when role === "manager"
  permissions: Joi.when("role", {
    is: "manager",
    then: permissionsSchema.optional(),
    otherwise: Joi.forbidden(),
  }),

  createdBy: Joi.string().custom(objectId).required(),
});

// One-time bootstrap: create the very first superadmin (no auth required,
// gated by SETUP_SECRET + only works while zero superadmins exist)
export const bootstrapSuperAdminValidation = Joi.object({
  setupKey: Joi.string().required(),
  fullName: Joi.string().trim().required(),
  mobileNumber: Joi.string()
    .length(11)
    .pattern(/^01[3-9]\d{8}$/)
    .required(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(8).required(),
});

// ---------------- 1.2 User Authentication ----------------
export const loginValidation = Joi.object({
  emailOrPhone: emailOrPhone.required(),
  password: Joi.string().required(),
});

export const logoutValidation = Joi.object({
  refreshToken: Joi.string().optional(),
});

export const forgotPasswordValidation = Joi.object({
  emailOrPhone: emailOrPhone.required(),
});

export const resetPasswordValidation = Joi.object({
  resetPasswordToken: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({ "any.only": "confirmPassword must match newPassword" }),
});

export const changePasswordValidation = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({ "any.only": "confirmPassword must match newPassword" }),
});

export const otpVerificationValidation = Joi.object({
  emailOrPhone: emailOrPhone.required(),
  code: Joi.string().length(6).pattern(/^\d+$/).required(),
  purpose: Joi.string()
    .valid("registration", "login", "reset-password", "change-mobile")
    .required(),
});

export const accountActivationValidation = Joi.object({
  userId: Joi.string().custom(objectId).required(),
  verificationToken: Joi.string().required(),
});

export const accountDeactivationValidation = Joi.object({
  userId: Joi.string().custom(objectId).required(),
  reason: Joi.string().trim().optional(),
});

// ---------------- 1.3 User Profile ----------------
export const updateProfileValidation = Joi.object({
  fullName: Joi.string().trim(),
  email: Joi.string().email(),
  mobileNumber: Joi.string()
    .length(11)
    .pattern(/^01[3-9]\d{8}$/),
  address: addressSchema,
  drivingLicense: drivingLicenseSchema,
  identification: identificationSchema,
  profilePicture: Joi.string().uri(),
}).min(1);

// Super Admin editing role/permissions/status of any account
export const updateAccountControlValidation = Joi.object({
  role: Joi.string().valid("superadmin", "manager", "driver", "customer"),
  permissions: permissionsSchema,
  centralStatus: Joi.string().valid(
    "active",
    "inactive",
    "suspended",
    "blocked",
  ),
  driverStatus: Joi.string().valid(
    "pending",
    "approved",
    "available",
    "assigned",
    "on-trip",
    "offline",
    "suspended",
    "inactive",
  ),
  updatedBy: Joi.string().custom(objectId).required(),
}).min(2); // at least the field being changed + updatedBy

export const updateProfilePictureValidation = Joi.object({
  profilePicture: Joi.string().uri().required(),
});

export const updateContactValidation = Joi.object({
  email: Joi.string().email(),
  mobileNumber: Joi.string()
    .length(11)
    .pattern(/^01[3-9]\d{8}$/),
}).min(1);

export const updateAddressValidation = addressSchema.min(1);

export const updateDrivingLicenseValidation = drivingLicenseSchema;

export const updateIdentificationValidation = identificationSchema;
