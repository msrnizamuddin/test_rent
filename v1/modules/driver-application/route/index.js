import { Router } from "express";
import driverApplicationRoute from "./driver-application.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Driver Application route working Good ✅" });
});

router.use("/web", driverApplicationRoute);
router.use("/app", driverApplicationRoute);

export default router;
