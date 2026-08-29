// route/userTracking.route.js

import express from "express";
import { logModule } from '../../../utils/moduleLogger.js';
logModule(import.meta.url);
import {
  createUserTrackingController,
  getAllUserTrackingsController,
  getUserTrackingByIdController,
  updateUserTrackingController,
  deleteUserTrackingController,
} from "../controller/userTracking.controller.js";

import {
  createUserTrackingValidation,
  updateUserTrackingValidation,
  deleteUserTrackingValidation
} from "../validation/userTracking.validation.js";

import {

  validateParams,
} from "../../auth/middleware/validate.middleware.js";

import { validate } from "../../../middleware/validate.middleware.js";

const router = express.Router();

router.post(
  "/",
  validate(createUserTrackingValidation),
  createUserTrackingController
);

router.get(
  "/",
  getAllUserTrackingsController
);

router.get(
  "/:id",
  validateParams(deleteUserTrackingValidation),
  getUserTrackingByIdController
);

router.patch(
  "/:id",
  validateParams(deleteUserTrackingValidation),
  validate(updateUserTrackingValidation),
  updateUserTrackingController
);

router.delete(
  "/:id",
  validateParams(deleteUserTrackingValidation),
  deleteUserTrackingController
);

export default router;