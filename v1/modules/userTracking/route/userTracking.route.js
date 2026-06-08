// route/userTracking.route.js

import express from "express";

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
  validate,
  validateParams,
} from "../../auth/middleware/validate.middleware.js";

const router = express.Router();
router.get(
  "/ping",
  (req, res) => {
    res.status(200).json({
      message: "Module is alive!",
    });
  },
);
router.post(
  "/",
  validate(createUserTrackingValidation),
  createUserTrackingController
);

router.get(
  "/all",
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