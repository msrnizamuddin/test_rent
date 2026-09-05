import { prisma } from "../../../../config/db.js";

const SELECT = {
  id: true,
  ownerType: true,
  ownerId: true,
  category: true,
  fileUrl: true,
  expiryDate: true,
  status: true,
  rejectionReason: true,
  verifiedById: true,
  createdAt: true,
  updatedAt: true,
};

// Safe "get everything" — no where clause, no pagination.
const getAll = async () =>
  prisma.document.findMany({ select: SELECT, orderBy: { createdAt: "desc" } });

const search = async ({ ownerType, ownerId, status, category }) => {
  const where = {
    ...(ownerType ? { ownerType } : {}),
    ...(ownerId ? { ownerId } : {}),
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
  };

  return prisma.document.findMany({
    where,
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });
};

const findById = async (id) =>
  prisma.document.findUnique({ where: { id }, select: SELECT });

const findByOwner = async (ownerType, ownerId) =>
  prisma.document.findMany({
    where: { ownerType, ownerId },
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });

const create = async (payload) =>
  prisma.document.create({
    data: {
      ownerType: payload.ownerType,
      ownerId: payload.ownerId,
      category: payload.category,
      fileUrl: payload.fileUrl,
      expiryDate: payload.expiryDate || null,
      status: "pending",
    },
    select: SELECT,
  });

const setStatus = async (id, status, { rejectionReason, verifiedById } = {}) => {
  try {
    return await prisma.document.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === "rejected" ? rejectionReason || null : null,
        verifiedById: verifiedById || null,
      },
      select: SELECT,
    });
  } catch (error) {
    if (error.code === "P2025") return null;
    throw error;
  }
};

const deleteById = async (id) => {
  try {
    return await prisma.document.delete({ where: { id }, select: { id: true } });
  } catch (error) {
    if (error.code === "P2025") return null;
    throw error;
  }
};

export default { getAll, search, findById, findByOwner, create, setStatus, deleteById };
