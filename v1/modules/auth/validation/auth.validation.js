import Joi from "joi";
import { requiredMessage } from "../../../utils/joi-messages.js";

const objectId = Joi.string().guid({ version: "uuidv4" });

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
  type: Joi.string().valid("nid", "passport").required().messages(requiredMessage("Identification type")),
  number: Joi.string().trim().required().messages(requiredMessage("Identification number")),
  frontImage: Joi.string().uri().optional(),
  backImage: Joi.string().uri().optional(),
  expiryDate: Joi.date().optional(),
});

const drivingLicenseSchema = Joi.object({
  number: Joi.string().trim().required().messages(requiredMessage("Driving license number")),
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
  fullName: Joi.string().trim().required().messages(requiredMessage("Full name")),
  mobileNumber: Joi.string()
    .length(11)
    .pattern(/^01[3-9]\d{8}$/)
    .required()
    .messages({
      ...requiredMessage("Mobile number"),
      "string.length": "Mobile number must be 11 digits",
      "string.pattern.base": "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)",
    }),
  email: Joi.string().email().optional(),

  password: Joi.string().min(8).required().messages({
    ...requiredMessage("Password"),
    "string.min": "Password must be at least 8 characters",
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({ ...requiredMessage("Confirm password"), "any.only": "confirmPassword must match password" }),

  address: addressSchema.optional(),

  identification: identificationSchema.optional(),
  drivingLicense: drivingLicenseSchema.optional(),

  profilePicture: Joi.string().uri().optional(),

  documents: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().trim().required().messages(requiredMessage("Document title")),
        fileUrl: Joi.string().uri().required().messages(requiredMessage("Document file URL")),
      }),
    )
    .optional(),
});

// Public self-signup for drivers: creates the User immediately but active
// and unverified (see authService.signupDriver) — a driver completes their
// profile/documents and an admin approves via updateAccountControl.
export const signupDriverValidation = Joi.object({
  fullName: Joi.string().trim().required().messages(requiredMessage("Full name")),
  mobileNumber: Joi.string()
    .length(11)
    .pattern(/^01[3-9]\d{8}$/)
    .required()
    .messages({
      ...requiredMessage("Mobile number"),
      "string.length": "Mobile number must be 11 digits",
      "string.pattern.base": "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)",
    }),
  email: Joi.string().email().optional(),
  licenseNumber: Joi.string().trim().required().messages(requiredMessage("License number")),
  password: Joi.string().min(8).required().messages({
    ...requiredMessage("Password"),
    "string.min": "Password must be at least 8 characters",
  }),
});

// Super Admin creating a Manager, Driver, or another Super Admin account
export const createStaffValidation = Joi.object({
  role: Joi.string().valid("superadmin", "manager", "driver").required().messages(requiredMessage("Role")),

  fullName: Joi.string().trim().required().messages(requiredMessage("Full name")),
  fatherName: Joi.string().trim().optional(),
  motherName: Joi.string().trim().optional(),
  dateOfBirth: Joi.date().optional(),
  mobileNumber: Joi.string()
    .length(11)
    .pattern(/^01[3-9]\d{8}$/)
    .required()
    .messages({
      ...requiredMessage("Mobile number"),
      "string.length": "Mobile number must be 11 digits",
      "string.pattern.base": "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)",
    }),
  email: Joi.string().email().optional(),

  password: Joi.string().min(8).required().messages({
    ...requiredMessage("Password"),
    "string.min": "Password must be at least 8 characters",
  }),

  address: addressSchema.optional(),
  identification: identificationSchema.optional(),

  // required when role === "driver"
  drivingLicense: Joi.when("role", {
    is: "driver",
    then: drivingLicenseSchema.required().messages(requiredMessage("Driving license")),
    otherwise: drivingLicenseSchema.optional(),
  }),

  profilePicture: Joi.string().uri().optional(),

  // only relevant when role === "manager"
  permissions: Joi.when("role", {
    is: "manager",
    then: permissionsSchema.optional(),
    otherwise: Joi.forbidden(),
  }),

  // injected by the controller from req.user.id — never accepted from the client
});

// One-time bootstrap: create the very first superadmin (no auth required,
// gated by SETUP_SECRET + only works while zero superadmins exist)
export const bootstrapSuperAdminValidation = Joi.object({
  setupKey: Joi.string().required().messages(requiredMessage("Setup key")),
  fullName: Joi.string().trim().required().messages(requiredMessage("Full name")),
  mobileNumber: Joi.string()
    .length(11)
    .pattern(/^01[3-9]\d{8}$/)
    .required()
    .messages({
      ...requiredMessage("Mobile number"),
      "string.length": "Mobile number must be 11 digits",
      "string.pattern.base": "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)",
    }),
  email: Joi.string().email().optional(),
  password: Joi.string().min(8).required().messages({
    ...requiredMessage("Password"),
    "string.min": "Password must be at least 8 characters",
  }),
});

// ---------------- 1.2 User Authentication ----------------
export const loginValidation = Joi.object({
  emailOrPhone: emailOrPhone.required().messages(requiredMessage("Email or phone")),
  password: Joi.string().required().messages(requiredMessage("Password")),
});

export const logoutValidation = Joi.object({
  refreshToken: Joi.string().optional(),
});

export const forgotPasswordValidation = Joi.object({
  emailOrPhone: emailOrPhone.required().messages(requiredMessage("Email or phone")),
});

export const resetPasswordValidation = Joi.object({
  resetPasswordToken: Joi.string().required().messages(requiredMessage("Reset password token")),
  newPassword: Joi.string().min(8).required().messages({
    ...requiredMessage("New password"),
    "string.min": "Password must be at least 8 characters",
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({ ...requiredMessage("Confirm password"), "any.only": "confirmPassword must match newPassword" }),
});

export const changePasswordValidation = Joi.object({
  oldPassword: Joi.string().required().messages(requiredMessage("Old password")),
  newPassword: Joi.string().min(8).required().messages({
    ...requiredMessage("New password"),
    "string.min": "Password must be at least 8 characters",
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({ ...requiredMessage("Confirm password"), "any.only": "confirmPassword must match newPassword" }),
});

export const otpVerificationValidation = Joi.object({
  emailOrPhone: emailOrPhone.required().messages(requiredMessage("Email or phone")),
  code: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    ...requiredMessage("OTP code"),
    "string.length": "OTP code must be 6 digits",
    "string.pattern.base": "OTP code must contain only digits",
  }),
  purpose: Joi.string()
    .valid("registration", "login", "reset-password", "change-mobile")
    .required()
    .messages(requiredMessage("Purpose")),
});

export const accountActivationValidation = Joi.object({
  userId: objectId.required().messages(requiredMessage("User id")),
  verificationToken: Joi.string().required().messages(requiredMessage("Verification token")),
});

export const accountDeactivationValidation = Joi.object({
  userId: objectId.required().messages(requiredMessage("User id")),
  reason: Joi.string().trim().optional(),
});

// ---------------- 1.3 User Profile ----------------
export const updateProfileValidation = Joi.object({
  fullName: Joi.string().trim(),
  fatherName: Joi.string().trim().allow(""),
  motherName: Joi.string().trim().allow(""),
  dateOfBirth: Joi.date(),
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
  // Required when centralStatus is being set to "inactive" — see
  // authService.updateAccountControl. Shown back to the driver on a
  // blocked login attempt.
  reason: Joi.when("centralStatus", {
    is: "inactive",
    then: Joi.string().trim().min(3).required().messages({
      "any.required": "A reason is required when deactivating an account",
      "string.empty": "A reason is required when deactivating an account",
      "string.min": "Reason must be at least 3 characters",
    }),
    otherwise: Joi.string().trim().optional(),
  }),
}).min(1);

// Super Admin / Manager editing any user's own personal/document details —
// distinct from updateAccountControl (role/status/permissions) and from
// updateProfile (self-service, requires being logged in as that user).
export const updateUserProfileValidation = Joi.object({
  fullName: Joi.string().trim(),
  fatherName: Joi.string().trim().allow(""),
  motherName: Joi.string().trim().allow(""),
  dateOfBirth: Joi.date(),
  email: Joi.string().email(),
  mobileNumber: Joi.string()
    .length(11)
    .pattern(/^01[3-9]\d{8}$/),
  address: addressSchema,
  identification: identificationSchema,
  drivingLicense: drivingLicenseSchema,
  profilePicture: Joi.string().uri(),
}).min(1);

export const updateProfilePictureValidation = Joi.object({
  profilePicture: Joi.string().uri().required().messages(requiredMessage("Profile picture URL")),
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
