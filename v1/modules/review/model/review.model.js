import { prisma } from "../../../../config/db.js";

const mapReview = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    tripId: row.tripId,
    customerId: row.customerId,
    driverId: row.driverId,
    vehicleId: row.vehicleId,
    driverRating: row.driverRating,
    vehicleRating: row.vehicleRating,
    reviewText: row.reviewText,
    isHidden: row.isHidden,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

const SELECT = {
  id: true,
  tripId: true,
  customerId: true,
  driverId: true,
  vehicleId: true,
  driverRating: true,
  vehicleRating: true,
  reviewText: true,
  isHidden: true,
  createdAt: true,
  updatedAt: true,
};

// The trip module owns the `trips` table; this module only reads from it
// to validate ownership/status and to pull driverId / vehicleId. The
// service layer consumes this in the original snake_case shape (customer_id,
// driver_id, vehicle_id, status) so that contract is preserved here.
const findTripById = async (tripId) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { id: true, customerId: true, driverId: true, vehicleId: true, status: true },
  });
  if (!trip) return null;
  return {
    id: trip.id,
    customer_id: trip.customerId,
    driver_id: trip.driverId,
    vehicle_id: trip.vehicleId,
    status: trip.status,
  };
};

const create = async ({ tripId, customerId, driverId, vehicleId, driverRating, vehicleRating, reviewText }) => {
  try {
    const review = await prisma.review.create({
      data: {
        tripId,
        customerId,
        driverId: driverId || null,
        vehicleId: vehicleId || null,
        driverRating: driverRating ?? null,
        vehicleRating: vehicleRating ?? null,
        reviewText: reviewText || null,
      },
      select: SELECT,
    });
    return mapReview(review);
  } catch (error) {
    // Preserve the original raw-SQL/Postgres unique-violation error code so
    // the service layer's existing `error.code === "23505"` check keeps working.
    if (error.code === "P2002") {
      const duplicateError = new Error("Duplicate review for this trip/customer");
      duplicateError.code = "23505";
      throw duplicateError;
    }
    throw error;
  }
};

const findById = async (id) => {
  const review = await prisma.review.findUnique({ where: { id }, select: SELECT });
  return mapReview(review);
};

const findMine = async (customerId) => {
  const reviews = await prisma.review.findMany({
    where: { customerId },
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });
  return reviews.map(mapReview);
};

const findVisibleForDriver = async (driverId) => {
  const where = { driverId, isHidden: false };
  const [reviews, agg] = await Promise.all([
    prisma.review.findMany({ where, select: SELECT, orderBy: { createdAt: "desc" } }),
    prisma.review.aggregate({
      _avg: { driverRating: true },
      _count: { driverRating: true },
      where: { ...where, driverRating: { not: null } },
    }),
  ]);

  return {
    reviews: reviews.map(mapReview),
    averageRating: agg._avg.driverRating !== null ? Number(agg._avg.driverRating.toFixed(2)) : null,
    totalRatings: agg._count.driverRating,
  };
};

const findVisibleForVehicle = async (vehicleId) => {
  const where = { vehicleId, isHidden: false };
  const [reviews, agg] = await Promise.all([
    prisma.review.findMany({ where, select: SELECT, orderBy: { createdAt: "desc" } }),
    prisma.review.aggregate({
      _avg: { vehicleRating: true },
      _count: { vehicleRating: true },
      where: { ...where, vehicleRating: { not: null } },
    }),
  ]);

  return {
    reviews: reviews.map(mapReview),
    averageRating: agg._avg.vehicleRating !== null ? Number(agg._avg.vehicleRating.toFixed(2)) : null,
    totalRatings: agg._count.vehicleRating,
  };
};

const findAll = async ({ driverId, vehicleId, isHidden, page, limit }) => {
  const where = {
    ...(driverId ? { driverId } : {}),
    ...(vehicleId ? { vehicleId } : {}),
    ...(typeof isHidden === "boolean" ? { isHidden } : {}),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      select: SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return { reviews: reviews.map(mapReview), total };
};

const setHidden = async (id, isHidden) => {
  try {
    const review = await prisma.review.update({
      where: { id },
      data: { isHidden },
      select: SELECT,
    });
    return mapReview(review);
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

const deleteById = async (id) => {
  try {
    return await prisma.review.delete({ where: { id }, select: { id: true } });
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

export default {
  findTripById,
  create,
  findById,
  findMine,
  findVisibleForDriver,
  findVisibleForVehicle,
  findAll,
  setHidden,
  deleteById,
};
