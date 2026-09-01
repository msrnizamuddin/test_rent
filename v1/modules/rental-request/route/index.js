import { Router } from "express";
import rentalRequestRoute from "./rental-request.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Rental request route working Good ✅" });
});

// Same endpoints exposed twice — once for the web app (Super Admin /
// Manager panel), once for the mobile app (Customer) — so each client can
// be versioned or restricted independently.
router.use("/web", rentalRequestRoute);
router.use("/app", rentalRequestRoute);

export default router;
