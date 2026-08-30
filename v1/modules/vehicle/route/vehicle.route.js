import express from "express";
import * as controller from "../controller/vehicle.controller.js";

import {
  searchVehicleValidation,
  vehicleIdParamValidation,
  createVehicleValidation,
  updateVehicleValidation,
} from "../validation/vehicle.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";
import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

router.get(
  "/",
  validate(searchVehicleValidation, "query"),
  controller.searchVehicles,
);

// ---------------- Vehicle Entry (module 7, superadmin/manager only) ----------------
router.post(
  "/",
  authenticate,
  authorize("superadmin", "manager"),
  validate(createVehicleValidation),
  controller.createVehicle,
);

router.patch(
  "/:vehicleId",
  authenticate,
  authorize("superadmin", "manager"),
  validate(vehicleIdParamValidation, "params"),
  validate(updateVehicleValidation),
  controller.updateVehicle,
);

router.delete(
  "/:vehicleId",
  authenticate,
  authorize("superadmin", "manager"),
  validate(vehicleIdParamValidation, "params"),
  controller.deleteVehicle,
);
// ---------------- 2.3 Vehicle Details
router.get(
  "/:vehicleId",
  validate(vehicleIdParamValidation, "params"),
  controller.getVehicleById,
);

export default router;
