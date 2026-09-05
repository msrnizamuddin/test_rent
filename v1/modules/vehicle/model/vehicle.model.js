import { prisma } from "../../../../config/db.js";

// Prisma enum member names can't contain hyphens, so the "on-trip" value
// (also used by driverStatus/rental workflows) is stored as availabilityStatus
// "on_trip" with a @map() back to "on-trip" on disk. Keep the wire-facing API
// on the original hyphenated spelling despite that.
const AVAILABILITY_TO_ENUM = { "on-trip": "on_trip" };
const AVAILABILITY_FROM_ENUM = { on_trip: "on-trip" };
const toAvailabilityEnum = (v) => (v ? AVAILABILITY_TO_ENUM[v] || v : v);
const fromAvailabilityEnum = (v) => (v ? AVAILABILITY_FROM_ENUM[v] || v : v);

const mapVehicle = (row) => {
  if (!row) return null;
  const { createdById, updatedById, ...rest } = row;
  return {
    ...rest,
    availabilityStatus: fromAvailabilityEnum(row.availabilityStatus),
    ...(createdById !== undefined ? { createdBy: createdById } : {}),
    ...(updatedById !== undefined ? { updatedBy: updatedById } : {}),
  };
};

const SELECT = {
  id: true,
  vehicleName: true,
  brand: true,
  vehicleModel: true,
  categoryId: true,
  vehicleType: true,
  images: true,
  registrationNumber: true,
  modelYear: true,
  seatingCapacity: true,
  fuelType: true,
  transmission: true,
  isAC: true,
  features: true,
  color: true,
  location: true,
  estimatedRentalRate: true,
  availabilityStatus: true,
  driverRequired: true,
  ownerInfo: true,
  documents: true,
  createdById: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
};

// Browsing only shows vehicles that are actually rentable/visible to the public
const PUBLICLY_VISIBLE_STATUSES = ["available", "assigned", "on_trip"];

const search = async ({
  search: searchTerm,
  brand,
  categoryId,
  location,
  vehicleType,
  seatingCapacity,
  minPrice,
  maxPrice,
  isAC,
  transmission,
  fuelType,
  availability,
  page,
  limit,
  sortBy,
  sortOrder,
}) => {
  const where = {
    availabilityStatus: availability
      ? toAvailabilityEnum(availability)
      : { in: PUBLICLY_VISIBLE_STATUSES },
  };

  if (searchTerm) {
    where.OR = [
      { vehicleName: { contains: searchTerm, mode: "insensitive" } },
      { brand: { contains: searchTerm, mode: "insensitive" } },
    ];
  }
  if (brand) where.brand = { equals: brand, mode: "insensitive" };
  if (categoryId) where.categoryId = categoryId;
  if (vehicleType) where.vehicleType = vehicleType;
  if (seatingCapacity) where.seatingCapacity = { gte: seatingCapacity };
  if (typeof isAC === "boolean") where.isAC = isAC;
  if (transmission) where.transmission = transmission;
  if (fuelType) where.fuelType = fuelType;

  if (location) {
    where.OR = (where.OR || []).concat([
      { location: { path: ["city"], string_contains: location } },
      { location: { path: ["district"], string_contains: location } },
      { location: { path: ["address"], string_contains: location } },
    ]);
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.AND = [
      ...(minPrice !== undefined
        ? [{ estimatedRentalRate: { path: ["perDay"], gte: minPrice } }]
        : []),
      ...(maxPrice !== undefined
        ? [{ estimatedRentalRate: { path: ["perDay"], lte: maxPrice } }]
        : []),
    ];
  }

  // Prisma can't order by a path inside a Json column, so a price sort
  // falls back to the newest-first default rather than reaching for raw SQL.
  const orderBy =
    sortBy === "modelYear"
      ? { modelYear: sortOrder === "asc" ? "asc" : "desc" }
      : { createdAt: sortOrder === "asc" ? "asc" : "desc" };

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      select: SELECT,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vehicle.count({ where }),
  ]);

  return { vehicles: vehicles.map(mapVehicle), total };
};

// Safe "get everything" — no where clause, every vehicle regardless of status.
const getAll = async () => {
  const vehicles = await prisma.vehicle.findMany({
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });
  return vehicles.map(mapVehicle);
};

const findPubliclyVisibleById = async (id) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id, availabilityStatus: { in: PUBLICLY_VISIBLE_STATUSES } },
    select: SELECT,
  });
  return mapVehicle(vehicle);
};

const findById = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id }, select: SELECT });
  return mapVehicle(vehicle);
};

const findByRegistrationNumber = async (registrationNumber, excludeId) =>
  prisma.vehicle.findFirst({
    where: { registrationNumber, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });

const create = async (payload, userId) => {
  const vehicle = await prisma.vehicle.create({
    data: {
      vehicleName: payload.vehicleName,
      brand: payload.brand,
      vehicleModel: payload.vehicleModel,
      categoryId: payload.categoryId || null,
      vehicleType: payload.vehicleType,
      images: payload.images || [],
      registrationNumber: payload.registrationNumber,
      modelYear: payload.modelYear,
      seatingCapacity: payload.seatingCapacity,
      fuelType: payload.fuelType,
      transmission: payload.transmission,
      isAC: payload.isAC ?? true,
      features: payload.features || [],
      color: payload.color || null,
      location: payload.location ?? null,
      estimatedRentalRate: payload.estimatedRentalRate ?? null,
      availabilityStatus: toAvailabilityEnum(payload.availabilityStatus) || "pending",
      driverRequired: payload.driverRequired ?? false,
      ownerInfo: payload.ownerInfo ?? null,
      documents: payload.documents || [],
      createdById: userId,
    },
    select: SELECT,
  });

  return mapVehicle(vehicle);
};

// Only whitelisted camelCase keys are ever written — everything here already
// matches the Prisma field name 1:1 except `updatedBy` -> `updatedById`.
const FIELD_MAP = {
  vehicleName: "vehicleName",
  brand: "brand",
  vehicleModel: "vehicleModel",
  categoryId: "categoryId",
  vehicleType: "vehicleType",
  images: "images",
  registrationNumber: "registrationNumber",
  modelYear: "modelYear",
  seatingCapacity: "seatingCapacity",
  fuelType: "fuelType",
  transmission: "transmission",
  isAC: "isAC",
  features: "features",
  color: "color",
  location: "location",
  estimatedRentalRate: "estimatedRentalRate",
  availabilityStatus: "availabilityStatus",
  driverRequired: "driverRequired",
  ownerInfo: "ownerInfo",
  documents: "documents",
  updatedBy: "updatedById",
};

const updateById = async (id, payload) => {
  const data = {};
  for (const [key, value] of Object.entries(payload)) {
    if (FIELD_MAP[key] === undefined) continue;
    data[FIELD_MAP[key]] = key === "availabilityStatus" ? toAvailabilityEnum(value) : value;
  }
  if (!Object.keys(data).length) return findById(id);

  try {
    const vehicle = await prisma.vehicle.update({ where: { id }, data, select: SELECT });
    return mapVehicle(vehicle);
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

const deleteById = async (id) => {
  try {
    return await prisma.vehicle.delete({ where: { id }, select: { id: true } });
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

export default {
  search,
  getAll,
  findPubliclyVisibleById,
  findById,
  findByRegistrationNumber,
  create,
  updateById,
  deleteById,
};
