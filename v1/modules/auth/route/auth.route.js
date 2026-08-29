import express from "express";
import * as controller from "../controller/auth.controller.js";

import {
  signupValidation,
  bootstrapSuperAdminValidation,
  createStaffValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  otpVerificationValidation,
  accountActivationValidation,
  accountDeactivationValidation,
  updateProfileValidation,
  updateProfilePictureValidation,
  updateContactValidation,
  updateAddressValidation,
  updateDrivingLicenseValidation,
  updateIdentificationValidation,
  updateAccountControlValidation,
} from "../validation/auth.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";
import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// ---------------- 1.1 Registration ----------------
router.post("/customer", validate(signupValidation), controller.signup);

// One-time bootstrap: create the first superadmin. No auth required —
// protected by SETUP_SECRET and blocked once a superadmin already exists.
router.post(
  "/bootstrap-superadmin",
  validate(bootstrapSuperAdminValidation),
  controller.bootstrapSuperAdmin,
);

// Super Admin creates Manager / Driver / another Super Admin account
router.post(
  "/staff",
  authenticate,
  authorize("superadmin"),
  validate(createStaffValidation),
  controller.createStaff,
);

// ---------------- 1.2 Authentication ----------------
router.post("/login", validate(loginValidation), controller.login);
router.post("/logout", authenticate, controller.logout);
router.post(
  "/forgot-password",
  validate(forgotPasswordValidation),
  controller.forgotPassword,
);
router.post(
  "/reset-password",
  validate(resetPasswordValidation),
  controller.resetPassword,
);
router.patch(
  "/change-password",
  authenticate,
  validate(changePasswordValidation),
  controller.changePassword,
);
router.post(
  "/verify-otp",
  validate(otpVerificationValidation),
  controller.verifyOtp,
);
router.post(
  "/activate",
  validate(accountActivationValidation),
  controller.activateAccount,
);
router.patch(
  "/deactivate",
  authenticate,
  validate(accountDeactivationValidation),
  controller.deactivateAccount,
);

// ---------------- 1.3 Profile ----------------
router.get("/profile", authenticate, controller.getProfile);

// Super Admin / Manager: list all registered users
router.get(
  "/users",
  authenticate,
  authorize("superadmin", "manager"),
  controller.getAllUsers,
);

// Super Admin / Manager: view a single user's details
router.get(
  "/users/:userId",
  authenticate,
  authorize("superadmin", "manager"),
  controller.getUserById,
);
router.patch(
  "/profile",
  authenticate,
  validate(updateProfileValidation),
  controller.updateProfile,
);
router.patch(
  "/profile/picture",
  authenticate,
  validate(updateProfilePictureValidation),
  controller.updateProfilePicture,
);
router.patch(
  "/profile/contact",
  authenticate,
  validate(updateContactValidation),
  controller.updateContact,
);
router.patch(
  "/profile/address",
  authenticate,
  validate(updateAddressValidation),
  controller.updateAddress,
);
router.patch(
  "/profile/driving-license",
  authenticate,
  validate(updateDrivingLicenseValidation),
  controller.updateDrivingLicense,
);
router.patch(
  "/profile/identification",
  authenticate,
  validate(updateIdentificationValidation),
  controller.updateIdentification,
);

// Super Admin: manage role / permissions / status of any account
router.patch(
  "/account/:userId",
  authenticate,
  authorize("superadmin"),
  validate(updateAccountControlValidation),
  controller.updateAccountControl,
);

export default router;
