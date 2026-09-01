import { Router } from "express";
import tripRoute from "./trip.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Trip route working Good ✅" });
});

// Same endpoints exposed twice — once for the web app (Super Admin /
// Manager panel), once for the mobile app (Customer / Driver) — so each
// client can be versioned or restricted independently.
router.use("/web", tripRoute);
router.use("/app", tripRoute);

export default router;
