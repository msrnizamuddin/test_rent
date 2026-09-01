import { prisma } from "../../../../config/db.js";

// Prisma's generated field names already match our camelCase API shape
// (see prisma/schema.prisma — every column is @map()'d from snake_case).
// The only reshaping needed is coercing the Decimal lat/lng fields to Number.
const mapLocation = (row) => {
  if (!row) return null;
  return {
    ...row,
    latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : null,
    longitude:
      row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : null,
  };
};

const SELECT = {
  id: true,
  name: true,
  address: true,
  city: true,
  district: true,
  latitude: true,
  longitude: true,
  type: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

const search = async ({ search: searchTerm, city, type, isActive }) => {
  const where = {};

  if (searchTerm) {
    where.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { address: { contains: searchTerm, mode: "insensitive" } },
      { city: { contains: searchTerm, mode: "insensitive" } },
      { district: { contains: searchTerm, mode: "insensitive" } },
    ];
  }
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (type) where.type = type;
  if (typeof isActive === "boolean") where.isActive = isActive;

  const locations = await prisma.location.findMany({
    where,
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });

  return locations.map(mapLocation);
};

const findById = async (id) => {
  const location = await prisma.location.findUnique({ where: { id }, select: SELECT });
  return mapLocation(location);
};

const create = async (payload) => {
  const location = await prisma.location.create({
    data: {
      name: payload.name,
      address: payload.address || null,
      city: payload.city || null,
      district: payload.district || null,
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      type: payload.type || "popular",
      isActive: payload.isActive ?? true,
    },
    select: SELECT,
  });

  return mapLocation(location);
};

const FIELD_MAP = {
  name: "name",
  address: "address",
  city: "city",
  district: "district",
  latitude: "latitude",
  longitude: "longitude",
  type: "type",
  isActive: "isActive",
};

const updateById = async (id, payload) => {
  const data = {};
  for (const [key, value] of Object.entries(payload)) {
    if (FIELD_MAP[key] === undefined) continue;
    data[FIELD_MAP[key]] = value;
  }
  if (!Object.keys(data).length) return findById(id);

  try {
    const location = await prisma.location.update({ where: { id }, data, select: SELECT });
    return mapLocation(location);
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

const deleteById = async (id) => {
  try {
    return await prisma.location.delete({ where: { id }, select: { id: true } });
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

export default {
  search,
  findById,
  create,
  updateById,
  deleteById,
};
