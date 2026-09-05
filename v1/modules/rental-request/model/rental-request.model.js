import { prisma } from "../../../../config/db.js";

// Prisma's generated field names already match our camelCase API shape (see
// prisma/schema.prisma — every column is @map()'d from snake_case). mapRentalRequest
// only needs to reshape reviewedById -> reviewedBy to match the pre-Prisma API shape.
const mapRentalRequest = (row) => {
  if (!row) return null;
  const { reviewedById, ...rest } = row;
  return {
    ...rest,
    ...(reviewedById !== undefined ? { reviewedBy: reviewedById } : {}),
  };
};

const SELECT = {
  id: true,
  customerId: true,
  tripType: true,
  vehicleId: true,
  pickupLocation: true,
  destination: true,
  returnLocation: true,
  pickupDate: true,
  pickupTime: true,
  returnDate: true,
  returnTime: true,
  passengerCount: true,
  driverRequired: true,
  specialInstructions: true,
  contactNumber: true,
  estimatedDistanceKm: true,
  estimatedRent: true,
  finalRent: true,
  status: true,
  assignedVehicleId: true,
  assignedDriverId: true,
  adminNotes: true,
  callNotes: true,
  cancellationReason: true,
  confirmedAt: true,
  reviewedById: true,
  createdAt: true,
  updatedAt: true,
};

// Requests in these statuses no longer hold a claim on a vehicle/driver.
const NON_TERMINAL_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "estimate_provided",
  "waiting_confirmation",
  "confirmed",
  "vehicle_assigned",
  "driver_assigned",
  "trip_started",
];

const CANCELLABLE_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "estimate_provided",
  "waiting_confirmation",
];

const create = async (payload, customerId) => {
  const rentalRequest = await prisma.rentalRequest.create({
    data: {
      customerId,
      tripType: payload.tripType,
      vehicleId: payload.vehicleId || null,
      pickupLocation: payload.pickupLocation,
      destination: payload.destination,
      returnLocation: payload.returnLocation ?? null,
      pickupDate: payload.pickupDate,
      pickupTime: payload.pickupTime,
      returnDate: payload.returnDate || null,
      returnTime: payload.returnTime || null,
      passengerCount: payload.passengerCount ?? 1,
      driverRequired: payload.driverRequired ?? false,
      specialInstructions: payload.specialInstructions || null,
      contactNumber: payload.contactNumber,
      estimatedDistanceKm: payload.estimatedDistanceKm ?? null,
      estimatedRent: payload.estimatedRent ?? null,
      status: payload.status || "submitted",
    },
    select: SELECT,
  });

  return mapRentalRequest(rentalRequest);
};

const findById = async (id) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({ where: { id }, select: SELECT });
  return mapRentalRequest(rentalRequest);
};

const findMineByCustomer = async ({ customerId, status, page, limit }) => {
  const where = { customerId, ...(status ? { status } : {}) };

  const [rentalRequests, total] = await Promise.all([
    prisma.rentalRequest.findMany({
      where,
      select: SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.rentalRequest.count({ where }),
  ]);

  return { rentalRequests: rentalRequests.map(mapRentalRequest), total };
};

const findAll = async ({ status, customerId, page, limit }) => {
  const where = {
    ...(status ? { status } : {}),
    ...(customerId ? { customerId } : {}),
  };

  const [rentalRequests, total] = await Promise.all([
    prisma.rentalRequest.findMany({
      where,
      select: SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.rentalRequest.count({ where }),
  ]);

  return { rentalRequests: rentalRequests.map(mapRentalRequest), total };
};

// Only whitelisted camelCase keys are ever written — everything here already
// matches the Prisma field name 1:1 except `reviewedBy` -> `reviewedById`.
const FIELD_MAP = {
  vehicleId: "vehicleId",
  estimatedRent: "estimatedRent",
  finalRent: "finalRent",
  status: "status",
  assignedVehicleId: "assignedVehicleId",
  assignedDriverId: "assignedDriverId",
  adminNotes: "adminNotes",
  callNotes: "callNotes",
  cancellationReason: "cancellationReason",
  confirmedAt: "confirmedAt",
  reviewedBy: "reviewedById",
};

const updateById = async (id, payload) => {
  const data = {};
  for (const [key, value] of Object.entries(payload)) {
    if (FIELD_MAP[key] === undefined) continue;
    data[FIELD_MAP[key]] = value;
  }
  if (!Object.keys(data).length) return findById(id);

  try {
    const rentalRequest = await prisma.rentalRequest.update({ where: { id }, data, select: SELECT });
    return mapRentalRequest(rentalRequest);
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

// Safe "get everything" — no where clause, no pagination.
const getAll = async () => {
  const rentalRequests = await prisma.rentalRequest.findMany({
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });
  return rentalRequests.map(mapRentalRequest);
};

// Double-booking guard against other *rental requests* that already hold a
// claim on this vehicle/driver (mirrors trip.model's vehicleHasOverlap /
// driverHasOverlap, which covers the trips table once a trip exists).
// Overlap semantics: [pickupDate, COALESCE(returnDate, pickupDate)] ranges
// intersect — pickup_date <= COALESCE($newReturn, $newPickup) AND
// COALESCE(return_date, pickup_date) >= $newPickup.
const overlapWhere = (assignedField, id, pickupDate, returnDate, excludeRequestId) => ({
  [assignedField]: id,
  status: { in: NON_TERMINAL_STATUSES },
  ...(excludeRequestId ? { id: { not: excludeRequestId } } : {}),
  pickupDate: { lte: returnDate || pickupDate },
  OR: [{ returnDate: { gte: pickupDate } }, { returnDate: null, pickupDate: { gte: pickupDate } }],
});

const vehicleHasOverlap = async (vehicleId, pickupDate, returnDate, excludeRequestId) => {
  const count = await prisma.rentalRequest.count({
    where: overlapWhere("assignedVehicleId", vehicleId, pickupDate, returnDate, excludeRequestId),
  });
  return count > 0;
};

const driverHasOverlap = async (driverId, pickupDate, returnDate, excludeRequestId) => {
  const count = await prisma.rentalRequest.count({
    where: overlapWhere("assignedDriverId", driverId, pickupDate, returnDate, excludeRequestId),
  });
  return count > 0;
};

export { CANCELLABLE_STATUSES };

export default {
  create,
  findById,
  findMineByCustomer,
  findAll,
  getAll,
  updateById,
  vehicleHasOverlap,
  driverHasOverlap,
};
