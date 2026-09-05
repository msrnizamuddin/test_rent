import { Router } from "express";
import reportRoute from "./report.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Report route working Good ✅" });
});

// Super Admin panel only — no /app mount.
router.use("/web", reportRoute);

export default router;
