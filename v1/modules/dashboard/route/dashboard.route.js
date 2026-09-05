import express from "express";
import * as controller from "../controller/dashboard.controller.js";

import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// Dashboard/reports are Super Admin / Manager territory — this whole
// module is the superadmin panel's analytics surface.
router.use(authenticate, authorize("superadmin", "manager"));

// ---------------- 6.1 Super Admin Dashboard ----------------
router.get("/stats", controller.getOverviewStats);

// ---------------- 28. Reports & Analytics ----------------
router.get("/reports/users", controller.getUserReport);
router.get("/reports/vehicles", controller.getVehicleReport);
router.get("/reports/drivers", controller.getDriverReport);
router.get("/reports/trips", controller.getTripReport);
router.get("/reports/financial", controller.getFinancialReport);

export default router;
