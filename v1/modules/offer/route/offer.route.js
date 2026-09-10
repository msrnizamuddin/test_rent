import express from "express";
import * as controller from "../controller/offer.controller.js";

import {
  searchOfferValidation,
  offerIdParamValidation,
  createOfferValidation,
  updateOfferValidation,
} from "../validation/offer.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";
import {
  authenticate,
  authorizePermission,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// Safe "get everything" — no filters, no conditions.
router.get("/all", controller.getAll);

router.get(
  "/",
  validate(searchOfferValidation, "query"),
  controller.searchOffers,
);

router.post(
  "/",
  authenticate,
  authorizePermission("settings"),
  validate(createOfferValidation),
  controller.createOffer,
);

router.patch(
  "/:offerId",
  authenticate,
  authorizePermission("settings"),
  validate(offerIdParamValidation, "params"),
  validate(updateOfferValidation),
  controller.updateOffer,
);

router.delete(
  "/:offerId",
  authenticate,
  authorizePermission("settings"),
  validate(offerIdParamValidation, "params"),
  controller.deleteOffer,
);

router.get(
  "/:offerId",
  validate(offerIdParamValidation, "params"),
  controller.getOfferById,
);

export default router;
