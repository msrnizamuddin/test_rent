import { Router } from "express";
import offerRoute from "./offer.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Offer route working Good ✅" });
});

router.use("/web", offerRoute);
router.use("/app", offerRoute);

export default router;
