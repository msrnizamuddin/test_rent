import express from "express";
import * as controller from "../controller/payment.controller.js";

import {
  recordPaymentValidation,
  updatePaymentStatusValidation,
  refundPaymentValidation,
  listPaymentsValidation,
  paymentIdParamValidation,
  tripIdParamValidation,
} from "../validation/payment.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";
import { authenticate, authorizePermission } from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// Safe "get everything" — no filters, no conditions.
router.get("/all", authenticate, authorizePermission("paymentManagement"), controller.getAll);

router.post(
  "/",
  authenticate,
  validate(recordPaymentValidation),
  controller.recordPayment,
);

router.patch(
  "/:paymentId/status",
  authenticate,
  authorizePermission("paymentManagement"),
  validate(paymentIdParamValidation, "params"),
  validate(updatePaymentStatusValidation),
  controller.updatePaymentStatus,
);

router.get("/mine", authenticate, controller.getMyPayments);

router.get(
  "/trip/:tripId",
  authenticate,
  validate(tripIdParamValidation, "params"),
  controller.getPaymentsByTrip,
);

router.get(
  "/",
  authenticate,
  authorizePermission("paymentManagement"),
  validate(listPaymentsValidation, "query"),
  controller.listPayments,
);

router.post(
  "/:paymentId/refund",
  authenticate,
  authorizePermission("paymentManagement"),
  validate(paymentIdParamValidation, "params"),
  validate(refundPaymentValidation),
  controller.refundPayment,
);

export default router;
