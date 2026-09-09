import express from "express";
import * as controller from "../controller/tourist-spot.controller.js";

import {
  searchTouristSpotValidation,
  touristSpotIdParamValidation,
  createTouristSpotValidation,
  updateTouristSpotValidation,
} from "../validation/tourist-spot.validation.js";

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
  validate(searchTouristSpotValidation, "query"),
  controller.searchTouristSpots,
);

router.post(
  "/",
  authenticate,
  authorize("superadmin", "manager"),
  validate(createTouristSpotValidation),
  controller.createTouristSpot,
);

router.patch(
  "/:touristSpotId",
  authenticate,
  authorize("superadmin", "manager"),
  validate(touristSpotIdParamValidation, "params"),
  validate(updateTouristSpotValidation),
  controller.updateTouristSpot,
);

router.delete(
  "/:touristSpotId",
  authenticate,
  authorize("superadmin", "manager"),
  validate(touristSpotIdParamValidation, "params"),
  controller.deleteTouristSpot,
);

router.get(
  "/:touristSpotId",
  validate(touristSpotIdParamValidation, "params"),
  controller.getTouristSpotById,
);

export default router;
