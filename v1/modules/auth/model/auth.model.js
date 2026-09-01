import { query } from "../../../../config/db.js";
import bcrypt from "bcryptjs";

// Columns kept snake_case to mirror the `users` table (see database/schema.sql).
// Every read maps rows back to camelCase so controllers/services never see snake_case.

const mapUser = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    role: row.role,
    permissions: row.permissions,
    fullName: row.full_name,
    mobileNumber: row.mobile_number,
    email: row.email,
    ...(row.password !== undefined ? { password: row.password } : {}),
    address: row.address,
    identification: row.identification,
    drivingLicense: row.driving_license,
    profilePicture: row.profile_picture,
    documents: row.documents,
    isVerified: row.is_verified,
    centralStatus: row.central_status,
    isActivated: row.is_activated,
    lastLoginAt: row.last_login_at,
    driverStatus: row.driver_status,
    ...(row.otp_code !== undefined
      ? {
          otp: row.otp_code
            ? {
                code: row.otp_code,
                purpose: row.otp_purpose,
                expiresAt: row.otp_expires_at,
              }
            : null,
        }
      : {}),
    ...(row.verification_token !== undefined
      ? { verificationToken: row.verification_token }
      : {}),
    ...(row.reset_password_token !== undefined
      ? {
          resetPasswordToken: row.reset_password_token,
          resetPasswordExpires: row.reset_password_expires,
        }
      : {}),
    ...(row.failed_login_attempts !== undefined
      ? { failedLoginAttempts: row.failed_login_attempts }
      : {}),
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const PUBLIC_COLUMNS = `
  id, role, permissions, full_name, mobile_number, email, address,
  identification, driving_license, profile_picture, documents, is_verified,
  central_status, is_activated, last_login_at, driver_status, created_by,
  updated_by, created_at, updated_at
`;

const findById = async (id) => {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`,
    [id],
  );
  return mapUser(rows[0]);
};

// Auth needs the password hash — callers must never leak this outward.
const findByIdWithSecrets = async (id) => {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS}, password, failed_login_attempts
     FROM users WHERE id = $1`,
    [id],
  );
  return mapUser(rows[0]);
};

const findByEmailOrPhoneWithSecrets = async (emailOrPhone) => {
  const isEmail = emailOrPhone.includes("@");
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS}, password, failed_login_attempts,
            otp_code, otp_purpose, otp_expires_at
     FROM users WHERE ${isEmail ? "email" : "mobile_number"} = $1`,
    [emailOrPhone],
  );
  return mapUser(rows[0]);
};

const findByEmailOrPhone = async (emailOrPhone) => {
  const isEmail = emailOrPhone.includes("@");
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE ${isEmail ? "email" : "mobile_number"} = $1`,
    [emailOrPhone],
  );
  return mapUser(rows[0]);
};

const findByMobileOrEmail = async (mobileNumber, email) => {
  const { rows } = await query(
    `SELECT id FROM users WHERE mobile_number = $1 OR ($2::text IS NOT NULL AND email = $2)`,
    [mobileNumber, email || null],
  );
  return rows[0] || null;
};

const findOtherByMobileOrEmail = async (id, mobileNumber, email) => {
  const { rows } = await query(
    `SELECT id FROM users
     WHERE id <> $1
       AND (($2::text IS NOT NULL AND mobile_number = $2) OR ($3::text IS NOT NULL AND email = $3))`,
    [id, mobileNumber || null, email || null],
  );
  return rows[0] || null;
};

const findOneSuperadmin = async () => {
  const { rows } = await query(`SELECT id FROM users WHERE role = 'superadmin' LIMIT 1`, []);
  return rows[0] || null;
};

const create = async (payload) => {
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const { rows } = await query(
    `INSERT INTO users (
       role, permissions, full_name, mobile_number, email, password, address,
       identification, driving_license, profile_picture, documents,
       is_verified, central_status, is_activated, driver_status,
       otp_code, otp_purpose, otp_expires_at, created_by
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
     ) RETURNING ${PUBLIC_COLUMNS}`,
    [
      payload.role || "customer",
      JSON.stringify(payload.permissions || {}),
      payload.fullName,
      payload.mobileNumber,
      payload.email || null,
      hashedPassword,
      payload.address ? JSON.stringify(payload.address) : null,
      payload.identification ? JSON.stringify(payload.identification) : null,
      payload.drivingLicense ? JSON.stringify(payload.drivingLicense) : null,
      payload.profilePicture || null,
      JSON.stringify(payload.documents || []),
      payload.isVerified || false,
      payload.centralStatus || "active",
      payload.isActivated || false,
      payload.driverStatus || null,
      payload.otp?.code || null,
      payload.otp?.purpose || null,
      payload.otp?.expiresAt || null,
      payload.createdBy || null,
    ],
  );

  return mapUser(rows[0]);
};

// Generic partial update — only whitelisted camelCase keys are ever written.
const COLUMN_MAP = {
  role: "role",
  permissions: "permissions",
  fullName: "full_name",
  mobileNumber: "mobile_number",
  email: "email",
  address: "address",
  identification: "identification",
  drivingLicense: "driving_license",
  profilePicture: "profile_picture",
  documents: "documents",
  isVerified: "is_verified",
  centralStatus: "central_status",
  isActivated: "is_activated",
  lastLoginAt: "last_login_at",
  driverStatus: "driver_status",
  updatedBy: "updated_by",
  failedLoginAttempts: "failed_login_attempts",
  lastLoginIp: "last_login_ip",
  verificationToken: "verification_token",
  resetPasswordToken: "reset_password_token",
  resetPasswordExpires: "reset_password_expires",
};

const JSON_COLUMNS = new Set(["permissions", "address", "identification", "driving_license", "documents"]);

const updateById = async (id, payload) => {
  const entries = Object.entries(payload).filter(
    ([key]) => COLUMN_MAP[key] !== undefined,
  );
  if (!entries.length) return findById(id);

  const setClauses = entries.map(([key], idx) => `${COLUMN_MAP[key]} = $${idx + 2}`);
  const values = entries.map(([key, value]) =>
    JSON_COLUMNS.has(COLUMN_MAP[key]) ? JSON.stringify(value) : value,
  );

  const { rows } = await query(
    `UPDATE users SET ${setClauses.join(", ")}, updated_at = now()
     WHERE id = $1 RETURNING ${PUBLIC_COLUMNS}`,
    [id, ...values],
  );

  return mapUser(rows[0]);
};

const updatePassword = async (id, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await query(`UPDATE users SET password = $2, updated_at = now() WHERE id = $1`, [
    id,
    hashedPassword,
  ]);
};

const setOtp = async (id, otp) => {
  await query(
    `UPDATE users SET otp_code = $2, otp_purpose = $3, otp_expires_at = $4, updated_at = now()
     WHERE id = $1`,
    [id, otp.code, otp.purpose, otp.expiresAt],
  );
};

const clearOtp = async (id) => {
  await query(
    `UPDATE users SET otp_code = NULL, otp_purpose = NULL, otp_expires_at = NULL, updated_at = now()
     WHERE id = $1`,
    [id],
  );
};

const incrementFailedLoginAttempts = async (id) => {
  await query(
    `UPDATE users SET failed_login_attempts = failed_login_attempts + 1, updated_at = now() WHERE id = $1`,
    [id],
  );
};

const recordLogin = async (id) => {
  await query(
    `UPDATE users SET failed_login_attempts = 0, last_login_at = now(), updated_at = now() WHERE id = $1`,
    [id],
  );
};

const setResetToken = async (id, hashedToken, expiresAt) => {
  await query(
    `UPDATE users SET reset_password_token = $2, reset_password_expires = $3, updated_at = now() WHERE id = $1`,
    [id, hashedToken, expiresAt],
  );
};

const findByResetToken = async (hashedToken) => {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS}, reset_password_token, reset_password_expires
     FROM users WHERE reset_password_token = $1 AND reset_password_expires > now()`,
    [hashedToken],
  );
  return mapUser(rows[0]);
};

const clearResetToken = async (id) => {
  await query(
    `UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL, updated_at = now() WHERE id = $1`,
    [id],
  );
};

const findAll = async ({ role, status, search, page, limit }) => {
  const conditions = [];
  const values = [];

  if (role) {
    values.push(role);
    conditions.push(`role = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`central_status = $${values.length}`);
  }
  if (search) {
    values.push(`%${search}%`);
    const idx = values.length;
    conditions.push(
      `(full_name ILIKE $${idx} OR mobile_number ILIKE $${idx} OR email ILIKE $${idx})`,
    );
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (page - 1) * limit;

  values.push(limit, offset);

  const [{ rows }, countResult] = await Promise.all([
    query(
      `SELECT ${PUBLIC_COLUMNS} FROM users ${where}
       ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    ),
    query(`SELECT COUNT(*)::int AS total FROM users ${where}`, values.slice(0, -2)),
  ]);

  return { users: rows.map(mapUser), total: countResult.rows[0].total };
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
  recordLogin,
  setResetToken,
  findByResetToken,
  clearResetToken,
  findAll,
  comparePassword,
};
