import express from "express";
import * as controller from "../controller/rental-request.controller.js";

import {
  createRentalRequestValidation,
  requestIdParamValidation,
  myRentalRequestsValidation,
  cancelRentalRequestValidation,
  listRentalRequestsValidation,
  reviewRentalRequestValidation,
  confirmRentalRequestValidation,
  assignVehicleValidation,
  assignDriverValidation,
  rejectRentalRequestValidation,
} from "../validation/rental-request.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";
import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// ---------------- 3. Create Rental Request ----------------
router.post(
  "/",
  authenticate,
  validate(createRentalRequestValidation),
  controller.createRentalRequest,
);

// ---------------- 10. Customer: My Rental Requests ----------------
router.get(
  "/mine",
  authenticate,
  validate(myRentalRequestsValidation, "query"),
  controller.getMyRentalRequests,
);

// ---------------- 11. Admin: List All ----------------
router.get(
  "/",
  authenticate,
  authorize("superadmin", "manager"),
  validate(listRentalRequestsValidation, "query"),
  controller.listRentalRequests,
);

// ---------------- 13. Admin: Assign Vehicle / Driver ----------------
router.patch(
  "/:requestId/assign-vehicle",
  authenticate,
  authorize("superadmin", "manager"),
  validate(requestIdParamValidation, "params"),
  validate(assignVehicleValidation),
  controller.assignVehicle,
);

router.patch(
  "/:requestId/assign-driver",
  authenticate,
  authorize("superadmin", "manager"),
  validate(requestIdParamValidation, "params"),
  validate(assignDriverValidation),
  controller.assignDriver,
);

// ---------------- 11. Admin: Review ----------------
router.patch(
  "/:requestId/review",
  authenticate,
  authorize("superadmin", "manager"),
  validate(requestIdParamValidation, "params"),
  validate(reviewRentalRequestValidation),
  controller.reviewRentalRequest,
);

// ---------------- 12. Admin: Confirm ----------------
router.patch(
  "/:requestId/confirm",
  authenticate,
  authorize("superadmin", "manager"),
  validate(requestIdParamValidation, "params"),
  validate(confirmRentalRequestValidation),
  controller.confirmRentalRequest,
);

// ---------------- Admin: Reject ----------------
router.patch(
  "/:requestId/reject",
  authenticate,
  authorize("superadmin", "manager"),
  validate(requestIdParamValidation, "params"),
  validate(rejectRentalRequestValidation),
  controller.rejectRentalRequest,
);

// ---------------- 10. Customer: Cancel ----------------
router.patch(
  "/:requestId/cancel",
  authenticate,
  validate(requestIdParamValidation, "params"),
  validate(cancelRentalRequestValidation),
  controller.cancelRentalRequest,
);

// ---------------- Get one (must be last — catches /:requestId) ----------------
router.get(
  "/:requestId",
  authenticate,
  validate(requestIdParamValidation, "params"),
  controller.getRentalRequestById,
);

export default router;
