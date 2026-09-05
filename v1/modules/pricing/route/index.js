import { Router } from "express";
import pricingRoute from "./pricing.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Pricing route working Good ✅" });
});

router.use("/web", pricingRoute);
router.use("/app", pricingRoute);

export default router;
