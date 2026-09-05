import express from "express";
import * as controller from "../controller/maintenance.controller.js";

import {
  searchMaintenanceValidation,
  maintenanceIdParamValidation,
  createMaintenanceValidation,
  updateMaintenanceValidation,
} from "../validation/maintenance.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";
import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// Vehicle maintenance is Super Admin / Manager territory end-to-end.
router.use(authenticate, authorize("superadmin", "manager"));

// Safe "get everything" — no filters, no conditions.
router.get("/all", controller.getAll);

router.get("/", validate(searchMaintenanceValidation, "query"), controller.searchMaintenance);

router.post("/", validate(createMaintenanceValidation), controller.createMaintenance);

router.patch(
  "/:maintenanceId",
  validate(maintenanceIdParamValidation, "params"),
  validate(updateMaintenanceValidation),
  controller.updateMaintenance,
);

router.delete(
  "/:maintenanceId",
  validate(maintenanceIdParamValidation, "params"),
  controller.deleteMaintenance,
);

router.get(
  "/:maintenanceId",
  validate(maintenanceIdParamValidation, "params"),
  controller.getMaintenanceById,
);

export default router;
