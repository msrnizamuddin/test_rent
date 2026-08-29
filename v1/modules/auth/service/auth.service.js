import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../model/auth.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const findByEmailOrPhone = (emailOrPhone) => {
  const isEmail = emailOrPhone.includes("@");
  return User.findOne(
    isEmail ? { email: emailOrPhone } : { mobileNumber: emailOrPhone },
  );
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sanitize = (userDoc) => {
  const user = userDoc.toObject();
  delete user.password;
  return user;
};

// ---------------- 1.1 Registration ----------------
const signup = async (payload) => {
  const existing = await User.findOne({
    $or: [{ mobileNumber: payload.mobileNumber }, { email: payload.email }],
  });
  if (existing)
    throw buildError("Mobile number or email already registered", 409);

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
    userId: user._id,
    otpSent: true,
    ...(process.env.NODE_ENV !== "production" ? { otp } : {}),
  };
};

// One-time bootstrap: create the very first superadmin.
// No auth token required (there's no admin yet to issue one), so this is
// gated by a SETUP_SECRET env var AND blocked once any superadmin already exists.
const bootstrapSuperAdmin = async ({ setupKey, ...payload }) => {
  if (!process.env.SETUP_SECRET || setupKey !== process.env.SETUP_SECRET) {
    throw buildError("Invalid setup key", 403);
  }

  const existingSuperAdmin = await User.findOne({ role: "superadmin" });
  if (existingSuperAdmin) {
    throw buildError(
      "A superadmin already exists — bootstrap is disabled",
      403,
    );
  }

  const existing = await User.findOne({
    $or: [{ mobileNumber: payload.mobileNumber }, { email: payload.email }],
  });
  if (existing)
    throw buildError("Mobile number or email already registered", 409);

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
  const existing = await User.findOne({
    $or: [{ mobileNumber: payload.mobileNumber }, { email: payload.email }],
  });
  if (existing)
    throw buildError("Mobile number or email already registered", 409);

  const user = await User.create({
    ...payload,
    isVerified: true,
    isActivated: true,
    ...(payload.role === "driver" ? { driverStatus: "pending" } : {}),
  });

  return sanitize(user);
};

// ---------------- 1.2 Authentication ----------------
const login = async ({ emailOrPhone, password }) => {
  const user = await findByEmailOrPhone(emailOrPhone).select(
    "+password +failedLoginAttempts",
  );
  if (!user) throw buildError("Invalid credentials", 401);

  if (user.centralStatus !== "active") {
    throw buildError(`Account is ${user.centralStatus}`, 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    await user.save();
    throw buildError("Invalid credentials", 401);
  }

  user.failedLoginAttempts = 0;
  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);
  return { token, user: sanitize(user) };
};

const logout = async () => {
  // stateless JWT — client discards token; hook in a token blacklist here if needed
  return { success: true };
};

const forgotPassword = async ({ emailOrPhone }) => {
  const user = await findByEmailOrPhone(emailOrPhone);
  if (!user) throw buildError("No account found", 404);

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  // TODO: dispatch resetToken via SMS/email provider once wired up
  console.log(`🔑 Password reset token for ${emailOrPhone}: ${resetToken}`);

  return {
    resetSent: true,
    // never expose this in production — only here to skip SMS/email during dev/testing
    ...(process.env.NODE_ENV !== "production" ? { resetToken } : {}),
  };
};

const resetPassword = async ({ resetPasswordToken, newPassword }) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetPasswordToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) throw buildError("Reset token is invalid or expired", 400);

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { success: true };
};

const changePassword = async (userId, { oldPassword, newPassword }) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw buildError("User not found", 404);

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw buildError("Old password is incorrect", 401);

  user.password = newPassword;
  await user.save();

  return { success: true };
};

const verifyOtp = async ({ emailOrPhone, code, purpose }) => {
  const user = await findByEmailOrPhone(emailOrPhone).select(
    "+otp.code +otp.purpose +otp.expiresAt",
  );
  if (
    !user ||
    !user.otp ||
    user.otp.code !== code ||
    user.otp.purpose !== purpose
  ) {
    throw buildError("Invalid OTP", 400);
  }
  if (user.otp.expiresAt < new Date()) throw buildError("OTP expired", 400);

  if (purpose === "registration") {
    user.isVerified = true;
    user.isActivated = true;
  }

  user.otp = undefined;
  await user.save();

  return { verified: true };
};

const activateAccount = async ({ userId, verificationToken }) => {
  const user = await User.findById(userId).select("+verificationToken");
  if (!user || user.verificationToken !== verificationToken) {
    throw buildError("Invalid activation request", 400);
  }

  user.isActivated = true;
  user.centralStatus = "active";
  user.verificationToken = undefined;
  await user.save();

  return { activated: true };
};

const deactivateAccount = async ({ userId, reason }) => {
  const user = await User.findById(userId);
  if (!user) throw buildError("User not found", 404);

  user.isActivated = false;
  user.centralStatus = "inactive";
  await user.save();

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

  const filter = {};
  if (role) filter.role = role;
  if (status) filter.centralStatus = status;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { mobileNumber: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

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
  const user = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });
  if (!user) throw buildError("User not found", 404);
  return user;
};

const updateProfilePicture = async (userId, { profilePicture }) => {
  return updateProfile(userId, { profilePicture });
};

const updateContact = async (userId, payload) => {
  if (payload.mobileNumber || payload.email) {
    const existing = await User.findOne({
      _id: { $ne: userId },
      $or: [
        ...(payload.mobileNumber
          ? [{ mobileNumber: payload.mobileNumber }]
          : []),
        ...(payload.email ? [{ email: payload.email }] : []),
      ],
    });
    if (existing)
      throw buildError("Mobile number or email already in use", 409);
  }
  return updateProfile(userId, payload);
};

const updateAddress = async (userId, address) =>
  updateProfile(userId, { address });

const updateDrivingLicense = async (userId, drivingLicense) =>
  updateProfile(userId, { drivingLicense });

const updateIdentification = async (userId, identification) =>
  updateProfile(userId, { identification });

// Super Admin: change role / permissions / status of any account
const updateAccountControl = async (userId, payload) => {
  const user = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });
  if (!user) throw buildError("User not found", 404);
  return user;
};

export default {
  signup,
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
