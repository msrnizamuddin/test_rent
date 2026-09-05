import express from "express";
import * as controller from "../controller/report.controller.js";

import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// Reports & Analytics is Super Admin / Manager territory — spec module 28.
// Kept as its own module (separate from /dashboard) so it can grow
// independently — pagination, date-range filters, CSV export, per-manager
// "Assigned" scoping (spec module 32) — without dragging the lightweight
// dashboard overview along with it.
router.use(authenticate, authorize("superadmin", "manager"));

router.get("/users", controller.getUserReport);
router.get("/vehicles", controller.getVehicleReport);
router.get("/drivers", controller.getDriverReport);
router.get("/trips", controller.getTripReport);
router.get("/financial", controller.getFinancialReport);

export default router;
