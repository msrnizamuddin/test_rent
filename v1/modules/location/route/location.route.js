import express from "express";
import * as controller from "../controller/location.controller.js";

import {
  searchLocationValidation,
  locationIdParamValidation,
  createLocationValidation,
  updateLocationValidation,
} from "../validation/location.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";
import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// Safe "get everything" — no filters, no conditions.
router.get("/all", controller.getAll);

router.get(
  "/",
  validate(searchLocationValidation, "query"),
  controller.searchLocations,
);

router.post(
  "/",
  authenticate,
  authorize("superadmin", "manager"),
  validate(createLocationValidation),
  controller.createLocation,
);

router.patch(
  "/:locationId",
  authenticate,
  authorize("superadmin", "manager"),
  validate(locationIdParamValidation, "params"),
  validate(updateLocationValidation),
  controller.updateLocation,
);

router.delete(
  "/:locationId",
  authenticate,
  authorize("superadmin", "manager"),
  validate(locationIdParamValidation, "params"),
  controller.deleteLocation,
);

router.get(
  "/:locationId",
  validate(locationIdParamValidation, "params"),
  controller.getLocationById,
);

export default router;
