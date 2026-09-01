import { Router } from "express";
import reviewRoute from "./review.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Review route working Good ✅" });
});

// Same endpoints exposed twice — once for the web app (Super Admin /
// Manager panel), once for the mobile app (User / Driver) — so each
// client can be versioned or restricted independently.
router.use("/web", reviewRoute);
router.use("/app", reviewRoute);

export default router;
