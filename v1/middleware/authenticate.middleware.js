import jwt from "jsonwebtoken";
import { prisma } from "../../config/db.js";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }

  // A signature-valid token can still point at a user that no longer
  // exists (e.g. the DB was reset/reseeded while a browser held onto an
  // old token) or one that's since been suspended/blocked. Trusting the
  // JWT payload alone let such a request sail through authenticate() and
  // fail much later as a raw foreign-key-violation 500 wherever req.user.id
  // got used (e.g. rental-request creation) — check the account is still
  // real and active here instead, so a stale session gets a clean 401.
  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, centralStatus: true, isVerified: true },
    });

    if (!user || user.centralStatus !== "active") {
      return res
        .status(401)
        .json({ success: false, message: "Session is no longer valid, please log in again" });
    }

    req.user = { id: user.id, role: user.role, isVerified: user.isVerified };
    next();
  } catch (err) {
    next(err);
  }
};

// Usage: authorize("superadmin"), authorize("superadmin", "manager")
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};

// Blocks a driver from trip-facing endpoints until an admin has approved
// their submitted documents (see auth.service.js updateAccountControl,
// which sets isVerified true only once that review passes).
export const requireVerifiedDriver = (req, res, next) => {
  if (req.user?.role === "driver" && !req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Please complete your profile and submit your documents for verification.",
    });
  }
  next();
};
