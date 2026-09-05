import { Router } from "express";
import maintenanceRoute from "./maintenance.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Maintenance route working Good ✅" });
});

router.use("/web", maintenanceRoute);

export default router;
