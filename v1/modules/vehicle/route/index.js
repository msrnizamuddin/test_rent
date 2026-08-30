import { Router } from "express";
import vehicleRoute from "./vehicle.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Vehicle route working Good ✅" });
});

router.use("/", vehicleRoute);

export default router;
