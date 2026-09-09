import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../model/auth.model.js";
import Document from "../../document/model/document.model.js";
import { recordAuditLog } from "../../audit-log/service/audit-log.service.js";

// Spec module 30 "Account Blocking": lock the account after this many
// consecutive failed login attempts, rather than leaving it purely advisory.
const MAX_FAILED_LOGIN_ATTEMPTS = 5;

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sanitize = (user) => {
  const clean = { ...user };
  delete clean.password;
  return clean;
};

// ---------------- 1.1 Registration ----------------
const signup = async (payload) => {
  const existing = await User.findByMobileOrEmail(payload.mobileNumber, payload.email);
  if (existing) throw buildError("Mobile number or email already registered", 409);

  const otp = generateOtp();

  const user = await User.create({
    ...payload,
    role: "customer",
    otp: {
      code: otp,
      purpose: "registration",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // TODO: dispatch OTP via SMS/email provider once wired up
  console.log(`🔑 Registration OTP for ${payload.mobileNumber}: ${otp}`);

  return {
    userId: user.id,
    otpSent: true,
    ...(process.env.NODE_ENV !== "production" ? { otp } : {}),
  };
};

// Public self-signup for drivers. Unlike customer signup there's no OTP
// step — login works right away (centralStatus defaults to "active"), but
// isVerified stays false until the driver completes their profile and
// documents (submitForReview below) and an admin approves them. The
// frontend is responsible for restricting an unverified driver to the
// profile/documents screen; driver-only trip endpoints also enforce this
// server-side (see trip.service.js / rental-request.service.js).
const signupDriver = async (payload) => {
  const existing = await User.findByMobileOrEmail(payload.mobileNumber, payload.email);
  if (existing) throw buildError("Mobile number or email already registered", 409);

  const user = await User.create({
    role: "driver",
    fullName: payload.fullName,
    mobileNumber: payload.mobileNumber,
    email: payload.email,
    password: payload.password,
    drivingLicense: { number: payload.licenseNumber },
    driverStatus: "pending",
  });

  return { userId: user.id };
};

// A driver marks their profile ready for review once they've filled in
// identification/driving-license details and uploaded at least one
// document (see document.model.js findByOwner). Admin then reviews and
// approves via updateAccountControl below, which re-checks documents
// exist before allowing driverStatus -> "approved".
const submitForReview = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw buildError("User not found", 404);

  if (!user.identification) throw buildError("Please add your NID/identification details first", 400);
  if (!user.drivingLicense) throw buildError("Please add your driving license details first", 400);

  const documents = await Document.findByOwner("user", userId);
  if (!documents.length) throw buildError("Please upload at least one document first", 400);

  return User.updateById(userId, { profileSubmittedAt: new Date() });
};

// One-time bootstrap: create the very first superadmin.
// No auth token required (there's no admin yet to issue one), so this is
// gated by a SETUP_SECRET env var AND blocked once any superadmin already exists.
const bootstrapSuperAdmin = async ({ setupKey, ...payload }) => {
  if (!process.env.SETUP_SECRET || setupKey !== process.env.SETUP_SECRET) {
    throw buildError("Invalid setup key", 403);
  }

  const existingSuperAdmin = await User.findOneSuperadmin();
  if (existingSuperAdmin) {
    throw buildError("A superadmin already exists — bootstrap is disabled", 403);
  }

  const existing = await User.findByMobileOrEmail(payload.mobileNumber, payload.email);
  if (existing) throw buildError("Mobile number or email already registered", 409);

  const user = await User.create({
    ...payload,
    role: "superadmin",
    isVerified: true,
    isActivated: true,
    centralStatus: "active",
  });

  return sanitize(user);
};

// Super Admin creates Manager / Driver / Super Admin accounts
const createStaff = async (payload) => {
  const existing = await User.findByMobileOrEmail(payload.mobileNumber, payload.email);
  if (existing) throw buildError("Mobile number or email already registered", 409);

  const user = await User.create({
    ...payload,
    isVerified: true,
    isActivated: true,
    ...(payload.role === "driver" ? { driverStatus: "pending" } : {}),
  });

  return sanitize(user);
};

// ---------------- 1.2 Authentication ----------------
const login = async ({ emailOrPhone, password }, ip) => {
  const user = await User.findByEmailOrPhoneWithSecrets(emailOrPhone);
  if (!user) {
    await recordAuditLog({ action: "login.failed", metadata: { emailOrPhone, reason: "no_such_account" }, ipAddress: ip });
    throw buildError("Invalid credentials", 401);
  }

  if (user.centralStatus !== "active") {
    await recordAuditLog({
      actorId: user.id,
      action: "login.blocked",
      entityType: "user",
      entityId: user.id,
      metadata: { centralStatus: user.centralStatus },
      ipAddress: ip,
    });
    // inactiveReason is the cause an admin is required to write whenever
    // they set centralStatus to "inactive" (see updateAccountControl) —
    // show it directly rather than the generic status label.
    const message =
      user.centralStatus === "inactive" && user.inactiveReason
        ? user.inactiveReason
        : `Account is ${user.centralStatus}`;
    throw buildError(message, 403);
  }

  const isMatch = await User.comparePassword(password, user.password);
  if (!isMatch) {
    const attempts = await User.incrementFailedLoginAttempts(user.id);

    if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
      await User.lockAccount(user.id);
      await recordAuditLog({
        actorId: user.id,
        action: "account.auto_locked",
        entityType: "user",
        entityId: user.id,
        metadata: { failedLoginAttempts: attempts },
        ipAddress: ip,
      });
      throw buildError("Account locked after too many failed login attempts", 403);
    }

    await recordAuditLog({
      actorId: user.id,
      action: "login.failed",
      entityType: "user",
      entityId: user.id,
      metadata: { failedLoginAttempts: attempts },
      ipAddress: ip,
    });
    throw buildError("Invalid credentials", 401);
  }

  await User.recordLogin(user.id, ip);
  await recordAuditLog({ actorId: user.id, action: "login.success", entityType: "user", entityId: user.id, ipAddress: ip });

  const token = signToken(user);
  return { token, user: sanitize(user) };
};

const logout = async () => {
  // stateless JWT — client discards token; hook in a token blacklist here if needed
  return { success: true };
};

const forgotPassword = async ({ emailOrPhone }) => {
  const user = await User.findByEmailOrPhone(emailOrPhone);
  if (!user) throw buildError("No account found", 404);

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  await User.setResetToken(user.id, hashedToken, new Date(Date.now() + 15 * 60 * 1000));

  // TODO: dispatch resetToken via SMS/email provider once wired up
  console.log(`🔑 Password reset token for ${emailOrPhone}: ${resetToken}`);

  return {
    resetSent: true,
    // never expose this in production — only here to skip SMS/email during dev/testing
    ...(process.env.NODE_ENV !== "production" ? { resetToken } : {}),
  };
};

const resetPassword = async ({ resetPasswordToken, newPassword }) => {
  const hashedToken = crypto.createHash("sha256").update(resetPasswordToken).digest("hex");

  const user = await User.findByResetToken(hashedToken);
  if (!user) throw buildError("Reset token is invalid or expired", 400);

  await User.updatePassword(user.id, newPassword);
  await User.clearResetToken(user.id);

  return { success: true };
};

const changePassword = async (userId, { oldPassword, newPassword }) => {
  const user = await User.findByIdWithSecrets(userId);
  if (!user) throw buildError("User not found", 404);

  const isMatch = await User.comparePassword(oldPassword, user.password);
  if (!isMatch) throw buildError("Old password is incorrect", 401);

  await User.updatePassword(userId, newPassword);

  return { success: true };
};

const verifyOtp = async ({ emailOrPhone, code, purpose }) => {
  const user = await User.findByEmailOrPhoneWithSecrets(emailOrPhone);
  if (!user || !user.otp || user.otp.code !== code || user.otp.purpose !== purpose) {
    throw buildError("Invalid OTP", 400);
  }
  if (new Date(user.otp.expiresAt) < new Date()) throw buildError("OTP expired", 400);

  if (purpose === "registration") {
    await User.updateById(user.id, { isVerified: true, isActivated: true });
  }

  await User.clearOtp(user.id);

  return { verified: true };
};

const activateAccount = async ({ userId, verificationToken }) => {
  const user = await User.findByIdWithSecrets(userId);
  if (!user || user.verificationToken !== verificationToken) {
    throw buildError("Invalid activation request", 400);
  }

  await User.updateById(userId, {
    isActivated: true,
    centralStatus: "active",
    verificationToken: null,
  });

  return { activated: true };
};

const deactivateAccount = async ({ userId, reason }) => {
  const user = await User.findById(userId);
  if (!user) throw buildError("User not found", 404);

  await User.updateById(userId, { isActivated: false, centralStatus: "inactive" });

  return { deactivated: true, reason: reason || null };
};

// ---------------- 1.3 Profile ----------------
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw buildError("User not found", 404);
  return user;
};

// Super Admin / Manager: list & search registered users
const getAllUsers = async (query = {}) => {
  const { role, status, search, page = 1, limit = 20 } = query;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);

  const { users, total } = await User.findAll({
    role,
    status,
    search,
    page: pageNum,
    limit: limitNum,
  });

  return {
    users,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw buildError("User not found", 404);
  return user;
};

const updateProfile = async (userId, payload) => {
  const user = await User.updateById(userId, payload);
  if (!user) throw buildError("User not found", 404);
  return user;
};

const updateProfilePicture = async (userId, { profilePicture }) =>
  updateProfile(userId, { profilePicture });

const updateContact = async (userId, payload) => {
  if (payload.mobileNumber || payload.email) {
    const existing = await User.findOtherByMobileOrEmail(
      userId,
      payload.mobileNumber,
      payload.email,
    );
    if (existing) throw buildError("Mobile number or email already in use", 409);
  }
  return updateProfile(userId, payload);
};

const updateAddress = async (userId, address) => updateProfile(userId, { address });

const updateDrivingLicense = async (userId, drivingLicense) =>
  updateProfile(userId, { drivingLicense });

const updateIdentification = async (userId, identification) =>
  updateProfile(userId, { identification });

// Super Admin: change role / permissions / status of any account.
// updatedByUserId comes from the authenticated caller (req.user.id) — never
// trust a client-supplied value for who made the change.
const updateAccountControl = async (userId, payload, updatedByUserId) => {
  const finalPayload = { ...payload };

  // Setting centralStatus to "inactive" requires a written cause (enforced
  // by Joi — see updateAccountControlValidation); store it, and clear any
  // stale reason once the account leaves "inactive" again.
  if (payload.centralStatus === "inactive") {
    finalPayload.inactiveReason = payload.reason;
  } else if (payload.centralStatus) {
    finalPayload.inactiveReason = null;
  }
  delete finalPayload.reason; // not a real User column

  // Approving a driver requires at least one uploaded document — this is
  // also the point at which they become "verified", since that's what the
  // review is for.
  if (payload.driverStatus === "approved") {
    const documents = await Document.findByOwner("user", userId);
    if (!documents.length) {
      throw buildError("Cannot approve: this driver has no documents uploaded", 400);
    }
    finalPayload.isVerified = true;
  }

  const user = await User.updateById(userId, { ...finalPayload, updatedBy: updatedByUserId });
  if (!user) throw buildError("User not found", 404);
  return user;
};

export default {
  signup,
  signupDriver,
  submitForReview,
  bootstrapSuperAdmin,
  createStaff,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyOtp,
  activateAccount,
  deactivateAccount,
  getProfile,
  getAllUsers,
  getUserById,
  updateProfile,
  updateProfilePicture,
  updateContact,
  updateAddress,
  updateDrivingLicense,
  updateIdentification,
  updateAccountControl,
};
