import express from "express";
import * as controller from "../controller/review.controller.js";

import {
  createReviewValidation,
  driverIdParamValidation,
  vehicleIdParamValidation,
  reviewIdParamValidation,
  getAllReviewsValidation,
} from "../validation/review.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";
import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// ---------------- POST / ----------------
router.post(
  "/",
  authenticate,
  authorize("customer"),
  validate(createReviewValidation),
  controller.createReview,
);

// ---------------- GET /mine ----------------
router.get("/mine", authenticate, authorize("customer"), controller.getMyReviews);

// ---------------- GET / (superadmin/manager list all) ----------------
router.get(
  "/",
  authenticate,
  authorize("superadmin", "manager"),
  validate(getAllReviewsValidation, "query"),
  controller.getAllReviews,
);

// ---------------- GET /driver/:driverId (public) ----------------
router.get(
  "/driver/:driverId",
  validate(driverIdParamValidation, "params"),
  controller.getDriverReviews,
);

// ---------------- GET /vehicle/:vehicleId (public) ----------------
router.get(
  "/vehicle/:vehicleId",
  validate(vehicleIdParamValidation, "params"),
  controller.getVehicleReviews,
);

// ---------------- PATCH /:reviewId/hide ----------------
router.patch(
  "/:reviewId/hide",
  authenticate,
  authorize("superadmin", "manager"),
  validate(reviewIdParamValidation, "params"),
  controller.hideReview,
);

// ---------------- PATCH /:reviewId/unhide ----------------
router.patch(
  "/:reviewId/unhide",
  authenticate,
  authorize("superadmin", "manager"),
  validate(reviewIdParamValidation, "params"),
  controller.unhideReview,
);

// ---------------- DELETE /:reviewId ----------------
router.delete(
  "/:reviewId",
  authenticate,
  authorize("superadmin", "manager"),
  validate(reviewIdParamValidation, "params"),
  controller.deleteReview,
);

export default router;
