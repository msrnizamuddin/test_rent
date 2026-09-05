import { prisma } from "../../../../config/db.js";
import bcrypt from "bcryptjs";

// Prisma enum member names can't contain hyphens, so the two enums whose
// original text values did ("on-trip" for driverStatus, "reset-password" /
// "change-mobile" for otpPurpose) are declared with underscored member names
// and a Postgres @map() back to the original hyphenated value on disk. These
// converters keep the wire-facing API (and existing client docs) on the
// original hyphenated spelling despite that.
const DRIVER_STATUS_TO_ENUM = { "on-trip": "on_trip" };
const DRIVER_STATUS_FROM_ENUM = { on_trip: "on-trip" };
const toDriverStatusEnum = (v) => (v ? DRIVER_STATUS_TO_ENUM[v] || v : v);
const fromDriverStatusEnum = (v) => (v ? DRIVER_STATUS_FROM_ENUM[v] || v : v);

const OTP_PURPOSE_TO_ENUM = { "reset-password": "reset_password", "change-mobile": "change_mobile" };
const OTP_PURPOSE_FROM_ENUM = { reset_password: "reset-password", change_mobile: "change-mobile" };
const toOtpPurposeEnum = (v) => (v ? OTP_PURPOSE_TO_ENUM[v] || v : v);
const fromOtpPurposeEnum = (v) => (v ? OTP_PURPOSE_FROM_ENUM[v] || v : v);

// Prisma's generated field names already match our camelCase API shape
// (see prisma/schema.prisma — every column is @map()'d from snake_case).
// mapUser only needs to reshape the fields whose external shape differs
// from the raw column: createdById/updatedById -> createdBy/updatedBy,
// the otp* scalars -> a nested `otp` object, and the two hyphenated enums.
const mapUser = (row) => {
  if (!row) return null;
  const { createdById, updatedById, otpCode, otpPurpose, otpExpiresAt, ...rest } = row;
  return {
    ...rest,
    ...(rest.driverStatus !== undefined
      ? { driverStatus: fromDriverStatusEnum(rest.driverStatus) }
      : {}),
    ...(createdById !== undefined ? { createdBy: createdById } : {}),
    ...(updatedById !== undefined ? { updatedBy: updatedById } : {}),
    ...(otpCode !== undefined
      ? {
          otp: otpCode
            ? { code: otpCode, purpose: fromOtpPurposeEnum(otpPurpose), expiresAt: otpExpiresAt }
            : null,
        }
      : {}),
  };
};

const PUBLIC_SELECT = {
  id: true,
  role: true,
  permissions: true,
  fullName: true,
  mobileNumber: true,
  email: true,
  address: true,
  identification: true,
  drivingLicense: true,
  profilePicture: true,
  documents: true,
  isVerified: true,
  centralStatus: true,
  isActivated: true,
  lastLoginAt: true,
  driverStatus: true,
  createdById: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
};

const findById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id }, select: PUBLIC_SELECT });
  return mapUser(user);
};

// Auth needs the password hash — callers must never leak this outward.
const findByIdWithSecrets = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { ...PUBLIC_SELECT, password: true, failedLoginAttempts: true },
  });
  return mapUser(user);
};

const findByEmailOrPhoneWithSecrets = async (emailOrPhone) => {
  const isEmail = emailOrPhone.includes("@");
  const user = await prisma.user.findUnique({
    where: isEmail ? { email: emailOrPhone } : { mobileNumber: emailOrPhone },
    select: {
      ...PUBLIC_SELECT,
      password: true,
      failedLoginAttempts: true,
      otpCode: true,
      otpPurpose: true,
      otpExpiresAt: true,
    },
  });
  return mapUser(user);
};

const findByEmailOrPhone = async (emailOrPhone) => {
  const isEmail = emailOrPhone.includes("@");
  const user = await prisma.user.findUnique({
    where: isEmail ? { email: emailOrPhone } : { mobileNumber: emailOrPhone },
    select: PUBLIC_SELECT,
  });
  return mapUser(user);
};

const findByMobileOrEmail = async (mobileNumber, email) =>
  prisma.user.findFirst({
    where: { OR: [{ mobileNumber }, ...(email ? [{ email }] : [])] },
    select: { id: true },
  });

const findOtherByMobileOrEmail = async (id, mobileNumber, email) =>
  prisma.user.findFirst({
    where: {
      id: { not: id },
      OR: [...(mobileNumber ? [{ mobileNumber }] : []), ...(email ? [{ email }] : [])],
    },
    select: { id: true },
  });

const findOneSuperadmin = async () =>
  prisma.user.findFirst({ where: { role: "superadmin" }, select: { id: true } });

const create = async (payload) => {
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: {
      role: payload.role || undefined,
      permissions: payload.permissions || {},
      fullName: payload.fullName,
      mobileNumber: payload.mobileNumber,
      email: payload.email || null,
      password: hashedPassword,
      address: payload.address ?? null,
      identification: payload.identification ?? null,
      drivingLicense: payload.drivingLicense ?? null,
      profilePicture: payload.profilePicture || null,
      documents: payload.documents || [],
      isVerified: payload.isVerified || false,
      centralStatus: payload.centralStatus || undefined,
      isActivated: payload.isActivated || false,
      driverStatus: toDriverStatusEnum(payload.driverStatus) || null,
      otpCode: payload.otp?.code || null,
      otpPurpose: toOtpPurposeEnum(payload.otp?.purpose) || null,
      otpExpiresAt: payload.otp?.expiresAt || null,
      createdById: payload.createdBy || null,
    },
    select: PUBLIC_SELECT,
  });

  return mapUser(user);
};

// Generic partial update — only whitelisted camelCase keys are ever written.
const FIELD_MAP = {
  role: "role",
  permissions: "permissions",
  fullName: "fullName",
  mobileNumber: "mobileNumber",
  email: "email",
  address: "address",
  identification: "identification",
  drivingLicense: "drivingLicense",
  profilePicture: "profilePicture",
  documents: "documents",
  isVerified: "isVerified",
  centralStatus: "centralStatus",
  isActivated: "isActivated",
  lastLoginAt: "lastLoginAt",
  driverStatus: "driverStatus",
  updatedBy: "updatedById",
  failedLoginAttempts: "failedLoginAttempts",
  lastLoginIp: "lastLoginIp",
  verificationToken: "verificationToken",
  resetPasswordToken: "resetPasswordToken",
  resetPasswordExpires: "resetPasswordExpires",
};

const updateById = async (id, payload) => {
  const data = {};
  for (const [key, value] of Object.entries(payload)) {
    if (FIELD_MAP[key] === undefined) continue;
    data[FIELD_MAP[key]] = key === "driverStatus" ? toDriverStatusEnum(value) : value;
  }
  if (!Object.keys(data).length) return findById(id);

  try {
    const user = await prisma.user.update({ where: { id }, data, select: PUBLIC_SELECT });
    return mapUser(user);
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

const updatePassword = async (id, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id }, data: { password: hashedPassword } });
};

const setOtp = async (id, otp) => {
  await prisma.user.update({
    where: { id },
    data: { otpCode: otp.code, otpPurpose: toOtpPurposeEnum(otp.purpose), otpExpiresAt: otp.expiresAt },
  });
};

const clearOtp = async (id) => {
  await prisma.user.update({
    where: { id },
    data: { otpCode: null, otpPurpose: null, otpExpiresAt: null },
  });
};

// Returns the post-increment count so the service layer can decide whether
// this attempt crosses the auto-lock threshold (spec module 30: Account Blocking).
const incrementFailedLoginAttempts = async (id) => {
  const user = await prisma.user.update({
    where: { id },
    data: { failedLoginAttempts: { increment: 1 } },
    select: { failedLoginAttempts: true },
  });
  return user.failedLoginAttempts;
};

const lockAccount = async (id) => {
  await prisma.user.update({ where: { id }, data: { centralStatus: "suspended" } });
};

const recordLogin = async (id, ip) => {
  await prisma.user.update({
    where: { id },
    data: { failedLoginAttempts: 0, lastLoginAt: new Date(), lastLoginIp: ip || null },
  });
};

const setResetToken = async (id, hashedToken, expiresAt) => {
  await prisma.user.update({
    where: { id },
    data: { resetPasswordToken: hashedToken, resetPasswordExpires: expiresAt },
  });
};

const findByResetToken = async (hashedToken) => {
  const user = await prisma.user.findFirst({
    where: { resetPasswordToken: hashedToken, resetPasswordExpires: { gt: new Date() } },
    select: { ...PUBLIC_SELECT, resetPasswordToken: true, resetPasswordExpires: true },
  });
  return mapUser(user);
};

const clearResetToken = async (id) => {
  await prisma.user.update({
    where: { id },
    data: { resetPasswordToken: null, resetPasswordExpires: null },
  });
};

const findAll = async ({ role, status, search, page, limit }) => {
  const where = {};
  if (role) where.role = role;
  if (status) where.centralStatus = status;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { mobileNumber: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: PUBLIC_SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users: users.map(mapUser), total };
};

const comparePassword = (plainPassword, hashedPassword) =>
  bcrypt.compare(plainPassword, hashedPassword);

export default {
  findById,
  findByIdWithSecrets,
  findByEmailOrPhone,
  findByEmailOrPhoneWithSecrets,
  findByMobileOrEmail,
  findOtherByMobileOrEmail,
  findOneSuperadmin,
  create,
  updateById,
  updatePassword,
  setOtp,
  clearOtp,
  incrementFailedLoginAttempts,
  lockAccount,
  recordLogin,
  setResetToken,
  findByResetToken,
  clearResetToken,
  findAll,
  comparePassword,
};
