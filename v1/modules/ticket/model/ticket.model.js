import { prisma } from "../../../../config/db.js";

const SELECT = {
  id: true,
  userId: true,
  subject: true,
  message: true,
  category: true,
  status: true,
  assignedToId: true,
  adminReply: true,
  createdAt: true,
  updatedAt: true,
};

const getAll = async () =>
  prisma.supportTicket.findMany({ select: SELECT, orderBy: { createdAt: "desc" } });

const search = async ({ status, userId }) => {
  const where = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;

  return prisma.supportTicket.findMany({
    where,
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });
};

const findById = async (id) =>
  prisma.supportTicket.findUnique({ where: { id }, select: SELECT });

const findByUser = async (userId) =>
  prisma.supportTicket.findMany({
    where: { userId },
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });

const create = async (userId, payload) =>
  prisma.supportTicket.create({
    data: {
      userId,
      subject: payload.subject,
      message: payload.message,
      category: payload.category || null,
    },
    select: SELECT,
  });

const FIELD_MAP = {
  status: "status",
  assignedToId: "assignedToId",
  adminReply: "adminReply",
};

const updateById = async (id, payload) => {
  const data = {};
  for (const [key, value] of Object.entries(payload)) {
    if (FIELD_MAP[key] === undefined) continue;
    data[FIELD_MAP[key]] = value;
  }
  if (!Object.keys(data).length) return findById(id);

  try {
    return await prisma.supportTicket.update({ where: { id }, data, select: SELECT });
  } catch (error) {
    if (error.code === "P2025") return null;
    throw error;
  }
};

export default { getAll, search, findById, findByUser, create, updateById };
