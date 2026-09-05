import authService from "../service/auth.service.js";

const handle = (fn) => async (req, res, next) => {
  try {
    const result = await fn(req, res);
    res.status(result.statusCode || 200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error); // forwarded to the global error handler
  }
};

// ---------------- 1.1 Registration ----------------
export const signup = handle(async (req) => {
  const data = await authService.signup(req.body);
  return {
    statusCode: 201,
    message: "Registration successful. OTP sent for verification.",
    data,
  };
});

export const bootstrapSuperAdmin = handle(async (req) => {
  const data = await authService.bootstrapSuperAdmin(req.body);
  return { statusCode: 201, message: "Superadmin created successfully", data };
});

export const createStaff = handle(async (req) => {
  const data = await authService.createStaff({
    ...req.body,
    createdBy: req.user?.id,
  });
  return { statusCode: 201, message: "Account created successfully", data };
});

// ---------------- 1.2 Authentication ----------------
export const login = handle(async (req) => {
  const data = await authService.login(req.body, req.ip);
  return { message: "Login successful", data };
});

export const logout = handle(async () => {
  const data = await authService.logout();
  return { message: "Logout successful", data };
});

export const forgotPassword = handle(async (req) => {
  const data = await authService.forgotPassword(req.body);
  return { message: "Password reset instructions sent", data };
});

export const resetPassword = handle(async (req) => {
  const data = await authService.resetPassword(req.body);
  return { message: "Password reset successful", data };
});

export const changePassword = handle(async (req) => {
  const data = await authService.changePassword(req.user.id, req.body);
  return { message: "Password changed successfully", data };
});

export const verifyOtp = handle(async (req) => {
  const data = await authService.verifyOtp(req.body);
  return { message: "OTP verified successfully", data };
});

export const activateAccount = handle(async (req) => {
  const data = await authService.activateAccount(req.body);
  return { message: "Account activated successfully", data };
});

export const deactivateAccount = handle(async (req) => {
  const data = await authService.deactivateAccount(req.body);
  return { message: "Account deactivated successfully", data };
});

// ---------------- 1.3 Profile ----------------
export const getProfile = handle(async (req) => {
  const data = await authService.getProfile(req.user.id);
  return { message: "Profile fetched successfully", data };
});

// Super Admin / Manager: list registered users, e.g. /users?role=customer&search=rakib&page=1&limit=20
export const getAllUsers = handle(async (req) => {
  const data = await authService.getAllUsers(req.query);
  return { message: "Users fetched successfully", data };
});

export const getUserById = handle(async (req) => {
  const data = await authService.getUserById(req.params.userId);
  return { message: "User fetched successfully", data };
});

export const updateProfile = handle(async (req) => {
  const data = await authService.updateProfile(req.user.id, req.body);
  return { message: "Profile updated successfully", data };
});

export const updateProfilePicture = handle(async (req) => {
  const data = await authService.updateProfilePicture(req.user.id, req.body);
  return { message: "Profile picture updated successfully", data };
});

export const updateContact = handle(async (req) => {
  const data = await authService.updateContact(req.user.id, req.body);
  return { message: "Contact information updated successfully", data };
});

export const updateAddress = handle(async (req) => {
  const data = await authService.updateAddress(req.user.id, req.body);
  return { message: "Address updated successfully", data };
});

export const updateDrivingLicense = handle(async (req) => {
  const data = await authService.updateDrivingLicense(req.user.id, req.body);
  return { message: "Driving license updated successfully", data };
});

export const updateIdentification = handle(async (req) => {
  const data = await authService.updateIdentification(req.user.id, req.body);
  return { message: "Identification document updated successfully", data };
});

// Super Admin only
export const updateAccountControl = handle(async (req) => {
  const data = await authService.updateAccountControl(
    req.params.userId,
    req.body,
  );
  return { message: "Account updated successfully", data };
});
