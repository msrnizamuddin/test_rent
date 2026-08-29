// route/index.js

import express from "express";
import userTrackingRoutes from "./userTracking.route.js";
import { logModule } from '../../../utils/moduleLogger.js';
logModule(import.meta.url);

const router = express.Router();
router.get("/health", (req, res) => {
  res.json({ message: "userTracking route working Good ✅" });
});

router.use(
  "/",
  userTrackingRoutes
);

export default router;