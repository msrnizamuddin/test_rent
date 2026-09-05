import express from "express";
import * as controller from "../controller/pricing.controller.js";

import {
  searchPricingValidation,
  pricingIdParamValidation,
  createPricingValidation,
  updatePricingValidation,
} from "../validation/pricing.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";
import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// Reading active rates is public — the frontend needs them to show
// estimates before a customer logs in. Writing them is Super Admin only.
router.get("/all", controller.getAll);
router.get("/", validate(searchPricingValidation, "query"), controller.searchPricing);
router.get("/:pricingId", validate(pricingIdParamValidation, "params"), controller.getPricingById);

router.post(
  "/",
  authenticate,
  authorize("superadmin"),
  validate(createPricingValidation),
  controller.createPricing,
);
router.patch(
  "/:pricingId",
  authenticate,
  authorize("superadmin"),
  validate(pricingIdParamValidation, "params"),
  validate(updatePricingValidation),
  controller.updatePricing,
);
router.delete(
  "/:pricingId",
  authenticate,
  authorize("superadmin"),
  validate(pricingIdParamValidation, "params"),
  controller.deletePricing,
);

export default router;
