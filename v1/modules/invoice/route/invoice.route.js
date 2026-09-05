import express from "express";
import * as controller from "../controller/invoice.controller.js";

import {
  generateInvoiceValidation,
  listInvoicesValidation,
  invoiceIdParamValidation,
  tripIdParamValidation,
} from "../validation/invoice.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";
import { authenticate, authorize } from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// Safe "get everything" — no filters, no conditions.
router.get("/all", authenticate, authorize("superadmin", "manager"), controller.getAll);

router.post(
  "/generate",
  authenticate,
  authorize("superadmin", "manager"),
  validate(generateInvoiceValidation),
  controller.generateInvoice,
);

router.get("/mine", authenticate, controller.getMyInvoices);

router.get(
  "/trip/:tripId",
  authenticate,
  validate(tripIdParamValidation, "params"),
  controller.getInvoiceByTripId,
);

router.get(
  "/",
  authenticate,
  authorize("superadmin", "manager"),
  validate(listInvoicesValidation, "query"),
  controller.listInvoices,
);

router.get(
  "/:invoiceId",
  authenticate,
  validate(invoiceIdParamValidation, "params"),
  controller.getInvoiceById,
);

export default router;
