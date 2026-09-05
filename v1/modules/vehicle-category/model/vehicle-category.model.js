import { prisma } from "../../../../config/db.js";

// Prisma's generated field names already match our camelCase API shape
// (see prisma/schema.prisma — every column is @map()'d from snake_case),
// so mapCategory is a straight passthrough.
const mapCategory = (row) => {
  if (!row) return null;
  return { ...row };
};

const SELECT = {
  id: true,
  name: true,
  description: true,
  image: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

const search = async ({ status }) => {
  const where = {};
  if (status) where.status = status;

  const categories = await prisma.vehicleCategory.findMany({
    where,
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });

  return categories.map(mapCategory);
};

// Safe "get everything" — no where clause at all.
const getAll = async () => {
  const categories = await prisma.vehicleCategory.findMany({
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });
  return categories.map(mapCategory);
};

const findById = async (id) => {
  const category = await prisma.vehicleCategory.findUnique({ where: { id }, select: SELECT });
  return mapCategory(category);
};

const findByName = async (name, excludeId) =>
  prisma.vehicleCategory.findFirst({
    where: { name, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });

const create = async (payload) => {
  const category = await prisma.vehicleCategory.create({
    data: {
      name: payload.name,
      description: payload.description || null,
      image: payload.image || null,
      status: payload.status || "active",
    },
    select: SELECT,
  });

  return mapCategory(category);
};

const FIELD_MAP = {
  name: "name",
  description: "description",
  image: "image",
  status: "status",
};

const updateById = async (id, payload) => {
  const data = {};
  for (const [key, value] of Object.entries(payload)) {
    if (FIELD_MAP[key] === undefined) continue;
    data[FIELD_MAP[key]] = value;
  }
  if (!Object.keys(data).length) return findById(id);

  try {
    const category = await prisma.vehicleCategory.update({ where: { id }, data, select: SELECT });
    return mapCategory(category);
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

const deleteById = async (id) => {
  try {
    return await prisma.vehicleCategory.delete({ where: { id }, select: { id: true } });
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    if (error.code === "P2003") {
      // Foreign key violation (category still referenced by vehicles) — the
      // service layer detects this by checking error.code === "23503", the
      // raw-pg FK-violation code, so translate Prisma's equivalent to match.
      const fkError = new Error("Category is in use by existing vehicles");
      fkError.code = "23503";
      throw fkError;
    }
    throw error;
  }
};

export default {
  search,
  getAll,
  findById,
  findByName,
  create,
  updateById,
  deleteById,
};
