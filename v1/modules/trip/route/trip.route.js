import express from "express";
import * as controller from "../controller/trip.controller.js";

import {
  tripIdParamValidation,
  myTripsValidation,
  assignedTripsValidation,
  listTripsValidation,
  driverActionValidation,
  updateLocationValidation,
  cancelTripValidation,
} from "../validation/trip.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";
import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// ---------------- 16. Customer: My Trips ----------------
router.get(
  "/mine",
  authenticate,
  validate(myTripsValidation, "query"),
  controller.getMyTrips,
);

// ---------------- 15. Driver: Assigned Trips ----------------
router.get(
  "/assigned",
  authenticate,
  authorize("driver"),
  validate(assignedTripsValidation, "query"),
  controller.getAssignedTrips,
);

// ---------------- 14. Admin: List All Trips ----------------
router.get(
  "/",
  authenticate,
  authorize("superadmin", "manager"),
  validate(listTripsValidation, "query"),
  controller.listTrips,
);

// ---------------- 15. Driver: Status Transitions ----------------
router.patch(
  "/:tripId/driver-action",
  authenticate,
  authorize("driver"),
  validate(tripIdParamValidation, "params"),
  validate(driverActionValidation),
  controller.driverAction,
);

// ---------------- 16.6 Driver: Live Location ----------------
router.patch(
  "/:tripId/location",
  authenticate,
  authorize("driver"),
  validate(tripIdParamValidation, "params"),
  validate(updateLocationValidation),
  controller.updateLocation,
);

// ---------------- Admin: Cancel ----------------
router.patch(
  "/:tripId/cancel",
  authenticate,
  authorize("superadmin", "manager"),
  validate(tripIdParamValidation, "params"),
  validate(cancelTripValidation),
  controller.cancelTrip,
);

// ---------------- Get one (must be last — catches /:tripId) ----------------
router.get(
  "/:tripId",
  authenticate,
  validate(tripIdParamValidation, "params"),
  controller.getTripById,
);

export default router;
