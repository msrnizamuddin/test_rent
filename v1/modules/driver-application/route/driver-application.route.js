import express from "express";
import * as controller from "../controller/driver-application.controller.js";

import {
  applicationIdParamValidation,
  searchApplicationValidation,
  submitApplicationValidation,
  rejectApplicationValidation,
} from "../validation/driver-application.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";
import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// Public — no self-service driver signup; this just queues an application
// for admin review.
router.post("/", validate(submitApplicationValidation), controller.submitApplication);

// Everything below is superadmin/manager only.
router.use(authenticate, authorize("superadmin", "manager"));

// Safe "get everything" — no filters, no conditions.
router.get("/all", controller.getAll);

router.get("/", validate(searchApplicationValidation, "query"), controller.searchApplications);

router.get(
  "/:applicationId",
  validate(applicationIdParamValidation, "params"),
  controller.getApplicationById,
);

router.patch(
  "/:applicationId/approve",
  validate(applicationIdParamValidation, "params"),
  controller.approveApplication,
);

router.patch(
  "/:applicationId/reject",
  validate(applicationIdParamValidation, "params"),
  validate(rejectApplicationValidation),
  controller.rejectApplication,
);

export default router;
