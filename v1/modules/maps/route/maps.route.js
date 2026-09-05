import express from "express";
import * as controller from "../controller/maps.controller.js";

import {
  autocompleteValidation,
  placeDetailsValidation,
  geocodeValidation,
  distanceValidation,
} from "../validation/maps.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";

const router = express.Router();

// Public — the location search bar calls this before the user has logged in.
router.get("/autocomplete", validate(autocompleteValidation, "query"), controller.autocomplete);
router.get("/place-details", validate(placeDetailsValidation, "query"), controller.placeDetails);
router.get("/geocode", validate(geocodeValidation, "query"), controller.geocode);
router.get("/distance", validate(distanceValidation, "query"), controller.distance);

export default router;
