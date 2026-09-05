import { Router } from "express";
import dashboardRoute from "./dashboard.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Dashboard route working Good ✅" });
});

// Super Admin panel only — no /app mount.
router.use("/web", dashboardRoute);

export default router;
