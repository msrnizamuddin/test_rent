import Review from "../model/review.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// ---------------- POST / ----------------
const createReview = async (customerId, { tripId, driverRating, vehicleRating, reviewText }) => {
  const trip = await Review.findTripById(tripId);
  if (!trip) throw buildError("Trip not found", 404);
  if (trip.customer_id !== customerId) {
    throw buildError("This trip does not belong to you", 400);
  }
  if (trip.status !== "trip_completed") {
    throw buildError("You can only review a completed trip", 400);
  }

  try {
    return await Review.create({
      tripId,
      customerId,
      driverId: trip.driver_id,
      vehicleId: trip.vehicle_id,
      driverRating,
      vehicleRating,
      reviewText,
    });
  } catch (error) {
    if (error.code === "23505") {
      throw buildError("You have already reviewed this trip", 409);
    }
    throw error;
  }
};

// ---------------- GET /mine ----------------
const getMyReviews = async (customerId) => Review.findMine(customerId);

// ---------------- GET /driver/:driverId ----------------
const getDriverReviews = async (driverId) => Review.findVisibleForDriver(driverId);

// ---------------- GET /vehicle/:vehicleId ----------------
const getVehicleReviews = async (vehicleId) => Review.findVisibleForVehicle(vehicleId);

// ---------------- GET / (admin) ----------------
const getAllReviews = async (queryParams) => {
  const { driverId, vehicleId, isHidden, page, limit } = queryParams;
  const { reviews, total } = await Review.findAll({ driverId, vehicleId, isHidden, page, limit });

  return {
    reviews,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ---------------- PATCH /:reviewId/hide ----------------
const hideReview = async (reviewId) => {
  const review = await Review.setHidden(reviewId, true);
  if (!review) throw buildError("Review not found", 404);
  return review;
};

// ---------------- PATCH /:reviewId/unhide ----------------
const unhideReview = async (reviewId) => {
  const review = await Review.setHidden(reviewId, false);
  if (!review) throw buildError("Review not found", 404);
  return review;
};

// ---------------- DELETE /:reviewId ----------------
const deleteReview = async (reviewId) => {
  const deleted = await Review.deleteById(reviewId);
  if (!deleted) throw buildError("Review not found", 404);
  return { deleted: true };
};

// Safe "get everything" — no filters, no conditions. Includes hidden reviews,
// so this stays staff-only (see route) rather than public like /driver/:id.
const getAll = async () => Review.getAll();

export default {
  createReview,
  getMyReviews,
  getDriverReviews,
  getVehicleReviews,
  getAllReviews,
  getAll,
  hideReview,
  unhideReview,
  deleteReview,
};
