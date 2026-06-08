// route/index.js

import express from "express";

import userTrackingRoutes from "./userTracking.route.js";

const router = express.Router();
router.get("/", (req, res) => {
  res.json({ message: "userTracking route working Good ✅" });
});
router.use(
  "/user-trackings",
  userTrackingRoutes
);

export default router;