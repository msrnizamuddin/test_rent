import { prisma } from "../../../../config/db.js";

const mapTouristSpot = (row) => {
  if (!row) return null;
  return { ...row };
};

const SELECT = {
  id: true,
  name: true,
  description: true,
  image: true,
  location: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

const search = async ({ status }) => {
  const where = {};
  if (status) where.status = status;

  const spots = await prisma.touristSpot.findMany({
    where,
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });

  return spots.map(mapTouristSpot);
};

// Safe "get everything" — no where clause at all.
const getAll = async () => {
  const spots = await prisma.touristSpot.findMany({
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });
  return spots.map(mapTouristSpot);
};

const findById = async (id) => {
  const spot = await prisma.touristSpot.findUnique({ where: { id }, select: SELECT });
  return mapTouristSpot(spot);
};

const create = async (payload) => {
  const spot = await prisma.touristSpot.create({
    data: {
      name: payload.name,
      description: payload.description || null,
      image: payload.image || null,
      location: payload.location || null,
      status: payload.status || "active",
    },
    select: SELECT,
  });

  return mapTouristSpot(spot);
};

const FIELD_MAP = {
  name: "name",
  description: "description",
  image: "image",
  location: "location",
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
    const spot = await prisma.touristSpot.update({ where: { id }, data, select: SELECT });
    return mapTouristSpot(spot);
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

const deleteById = async (id) => {
  try {
    return await prisma.touristSpot.delete({ where: { id }, select: { id: true } });
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

export default {
  search,
  getAll,
  findById,
  create,
  updateById,
  deleteById,
};
