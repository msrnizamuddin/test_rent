import { prisma } from "../../../../config/db.js";

// Prisma's generated field names already match our camelCase API shape (see
// prisma/schema.prisma — every column is @map()'d from snake_case), so trip
// rows need no reshaping before being returned to callers.
const mapTrip = (row) => row;

const SELECT = {
  id: true,
  rentalRequestId: true,
  customerId: true,
  vehicleId: true,
  driverId: true,
  tripType: true,
  pickupLocation: true,
  destination: true,
  returnLocation: true,
  pickupDate: true,
  pickupTime: true,
  returnDate: true,
  returnTime: true,
  estimatedDistanceKm: true,
  finalRent: true,
  paymentStatus: true,
  status: true,
  driverCurrentLocation: true,
  startedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
};

// Trip statuses that represent an active/ongoing hold on a vehicle or driver
// (used for double-booking checks). Cancelled/completed trips no longer block.
const NON_TERMINAL_TRIP_STATUSES = [
  "confirmed",
  "vehicle_assigned",
  "driver_assigned",
  "driver_accepted",
  "driver_on_the_way",
  "customer_picked_up",
  "trip_started",
  "trip_in_progress",
  "destination_reached",
  "return_started",
];

const findById = async (id) => {
  const trip = await prisma.trip.findUnique({ where: { id }, select: SELECT });
  return mapTrip(trip);
};

const findByRentalRequestId = async (rentalRequestId) => {
  const trip = await prisma.trip.findUnique({ where: { rentalRequestId }, select: SELECT });
  return mapTrip(trip);
};

const create = async (payload) => {
  const trip = await prisma.trip.create({
    data: {
      rentalRequestId: payload.rentalRequestId,
      customerId: payload.customerId,
      vehicleId: payload.vehicleId || null,
      driverId: payload.driverId || null,
      tripType: payload.tripType,
      pickupLocation: payload.pickupLocation,
      destination: payload.destination,
      returnLocation: payload.returnLocation ?? null,
      pickupDate: payload.pickupDate,
      pickupTime: payload.pickupTime,
      returnDate: payload.returnDate || null,
      returnTime: payload.returnTime || null,
      estimatedDistanceKm: payload.estimatedDistanceKm ?? null,
      finalRent: payload.finalRent ?? null,
      status: payload.status || "confirmed",
    },
    select: SELECT,
  });

  return mapTrip(trip);
};

// Only whitelisted camelCase keys are ever written — every key here already
// matches the Prisma field name 1:1.
const FIELD_MAP = {
  vehicleId: "vehicleId",
  driverId: "driverId",
  finalRent: "finalRent",
  paymentStatus: "paymentStatus",
  status: "status",
  driverCurrentLocation: "driverCurrentLocation",
  startedAt: "startedAt",
  completedAt: "completedAt",
};

const updateById = async (id, payload) => {
  const data = {};
  for (const [key, value] of Object.entries(payload)) {
    if (FIELD_MAP[key] === undefined) continue;
    data[FIELD_MAP[key]] = value;
  }
  if (!Object.keys(data).length) return findById(id);

  try {
    const trip = await prisma.trip.update({ where: { id }, data, select: SELECT });
    return mapTrip(trip);
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

const findMineByCustomer = async ({ customerId, status, page, limit }) => {
  const where = { customerId, ...(status ? { status } : {}) };

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      select: SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.trip.count({ where }),
  ]);

  return { trips: trips.map(mapTrip), total };
};

const findAssignedByDriver = async ({ driverId, status }) => {
  const trips = await prisma.trip.findMany({
    where: { driverId, ...(status ? { status } : {}) },
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });
  return trips.map(mapTrip);
};

const findAll = async ({ status, driverId, customerId, page, limit }) => {
  const where = {
    ...(status ? { status } : {}),
    ...(driverId ? { driverId } : {}),
    ...(customerId ? { customerId } : {}),
  };

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      select: SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.trip.count({ where }),
  ]);

  return { trips: trips.map(mapTrip), total };
};

// Double-booking guard: does this vehicle/driver already have an active trip
// whose [pickup_date, COALESCE(return_date, pickup_date)] range overlaps the
// given range? excludeTripId lets an update ignore the trip's own row.
const overlapWhere = (field, id, pickupDate, returnDate, excludeTripId) => ({
  [field]: id,
  status: { in: NON_TERMINAL_TRIP_STATUSES },
  ...(excludeTripId ? { id: { not: excludeTripId } } : {}),
  pickupDate: { lte: returnDate || pickupDate },
  OR: [{ returnDate: { gte: pickupDate } }, { returnDate: null, pickupDate: { gte: pickupDate } }],
});

const vehicleHasOverlap = async (vehicleId, pickupDate, returnDate, excludeTripId) => {
  const count = await prisma.trip.count({
    where: overlapWhere("vehicleId", vehicleId, pickupDate, returnDate, excludeTripId),
  });
  return count > 0;
};

const driverHasOverlap = async (driverId, pickupDate, returnDate, excludeTripId) => {
  const count = await prisma.trip.count({
    where: overlapWhere("driverId", driverId, pickupDate, returnDate, excludeTripId),
  });
  return count > 0;
};

export default {
  findById,
  findByRentalRequestId,
  create,
  updateById,
  findMineByCustomer,
  findAssignedByDriver,
  findAll,
  vehicleHasOverlap,
  driverHasOverlap,
};
