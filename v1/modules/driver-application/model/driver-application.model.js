import { prisma } from "../../../../config/db.js";

// passwordHash never leaves this module — every external caller goes
// through mapApplication, which strips it.
const mapApplication = (row) => {
  if (!row) return null;
  const { passwordHash, ...rest } = row;
  return rest;
};

const SELECT = {
  id: true,
  fullName: true,
  mobileNumber: true,
  email: true,
  licenseNumber: true,
  status: true,
  rejectionReason: true,
  reviewedById: true,
  createdAt: true,
  updatedAt: true,
};

const search = async ({ status }) => {
  const where = {};
  if (status) where.status = status;

  const applications = await prisma.driverApplication.findMany({
    where,
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });

  return applications.map(mapApplication);
};

// Safe "get everything" — no where clause at all.
const getAll = async () => {
  const applications = await prisma.driverApplication.findMany({
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });
  return applications.map(mapApplication);
};

const findById = async (id) => {
  const application = await prisma.driverApplication.findUnique({ where: { id }, select: SELECT });
  return mapApplication(application);
};

// Internal only — includes the password hash, needed solely to approve an
// application into a real User without asking the applicant to re-enter it.
const findByIdWithHash = async (id) => prisma.driverApplication.findUnique({ where: { id } });

const findPendingByMobile = async (mobileNumber) =>
  prisma.driverApplication.findFirst({
    where: { mobileNumber, status: "pending" },
    select: { id: true },
  });

const create = async (payload) => {
  const application = await prisma.driverApplication.create({
    data: {
      fullName: payload.fullName,
      mobileNumber: payload.mobileNumber,
      email: payload.email || null,
      licenseNumber: payload.licenseNumber,
      passwordHash: payload.passwordHash,
    },
    select: SELECT,
  });

  return mapApplication(application);
};

const setStatus = async (id, status, extra = {}) => {
  try {
    const application = await prisma.driverApplication.update({
      where: { id },
      data: { status, ...extra },
      select: SELECT,
    });
    return mapApplication(application);
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

export default {
  search,
  getAll,
  findById,
  findByIdWithHash,
  findPendingByMobile,
  create,
  setStatus,
};
