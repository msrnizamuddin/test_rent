import express from "express";
import * as controller from "../controller/dashboard.controller.js";

import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

// Dashboard is Super Admin / Manager territory — spec module 6.1.
router.use(authenticate, authorize("superadmin", "manager"));

router.get("/stats", controller.getOverviewStats);

export default router;
