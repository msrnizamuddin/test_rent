import bcrypt from "bcryptjs";
import DriverApplication from "../model/driver-application.model.js";
import User from "../../auth/model/auth.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const searchApplications = async (query) => DriverApplication.search(query);

// Safe "get everything" — no filters, no conditions.
const getAll = async () => DriverApplication.getAll();

const getApplicationById = async (id) => {
  const application = await DriverApplication.findById(id);
  if (!application) throw buildError("Application not found", 404);
  return application;
};

const submitApplication = async (payload) => {
  const existingUser = await User.findByMobileOrEmail(payload.mobileNumber, payload.email);
  if (existingUser) throw buildError("An account with this phone number already exists", 409);

  const pending = await DriverApplication.findPendingByMobile(payload.mobileNumber);
  if (pending) {
    throw buildError("An application with this phone number is already pending review", 409);
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  return DriverApplication.create({ ...payload, passwordHash });
};

// Approving creates the real driver User from the application's own data —
// the applicant never has to re-enter anything, and their original password
// (only ever stored hashed) carries straight over.
const approveApplication = async (id, reviewerId) => {
  const application = await DriverApplication.findByIdWithHash(id);
  if (!application) throw buildError("Application not found", 404);
  if (application.status !== "pending") throw buildError("Application already reviewed", 409);

  await User.create({
    role: "driver",
    fullName: application.fullName,
    mobileNumber: application.mobileNumber,
    email: application.email,
    passwordHash: application.passwordHash,
    drivingLicense: { number: application.licenseNumber },
    isVerified: true,
    isActivated: true,
    centralStatus: "active",
    createdBy: reviewerId,
  });

  return DriverApplication.setStatus(id, "approved", { reviewedById: reviewerId });
};

const rejectApplication = async (id, reviewerId, rejectionReason) => {
  const application = await DriverApplication.findById(id);
  if (!application) throw buildError("Application not found", 404);
  if (application.status !== "pending") throw buildError("Application already reviewed", 409);

  return DriverApplication.setStatus(id, "rejected", { reviewedById: reviewerId, rejectionReason });
};

export default {
  searchApplications,
  getAll,
  getApplicationById,
  submitApplication,
  approveApplication,
  rejectApplication,
};
