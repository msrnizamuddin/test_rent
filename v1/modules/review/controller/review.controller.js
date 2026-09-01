import reviewService from "../service/review.service.js";

const handle = (fn) => async (req, res, next) => {
  try {
    const result = await fn(req, res);
    res.status(result.statusCode || 200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------- POST / ----------------
export const createReview = handle(async (req) => {
  const data = await reviewService.createReview(req.user.id, req.body);
  return { statusCode: 201, message: "Review submitted successfully", data };
});

// ---------------- GET /mine ----------------
export const getMyReviews = handle(async (req) => {
  const data = await reviewService.getMyReviews(req.user.id);
  return { message: "Reviews fetched successfully", data };
});

// ---------------- GET /driver/:driverId ----------------
export const getDriverReviews = handle(async (req) => {
  const data = await reviewService.getDriverReviews(req.params.driverId);
  return { message: "Driver reviews fetched successfully", data };
});

// ---------------- GET /vehicle/:vehicleId ----------------
export const getVehicleReviews = handle(async (req) => {
  const data = await reviewService.getVehicleReviews(req.params.vehicleId);
  return { message: "Vehicle reviews fetched successfully", data };
});

// ---------------- GET / (superadmin/manager) ----------------
export const getAllReviews = handle(async (req) => {
  const data = await reviewService.getAllReviews(req.query);
  return { message: "Reviews fetched successfully", data };
});

// ---------------- PATCH /:reviewId/hide ----------------
export const hideReview = handle(async (req) => {
  const data = await reviewService.hideReview(req.params.reviewId);
  return { message: "Review hidden successfully", data };
});

// ---------------- PATCH /:reviewId/unhide ----------------
export const unhideReview = handle(async (req) => {
  const data = await reviewService.unhideReview(req.params.reviewId);
  return { message: "Review unhidden successfully", data };
});

// ---------------- DELETE /:reviewId ----------------
export const deleteReview = handle(async (req) => {
  const data = await reviewService.deleteReview(req.params.reviewId);
  return { message: "Review deleted successfully", data };
});
