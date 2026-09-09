import { Router } from "express";
import touristSpotRoute from "./tourist-spot.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Tourist Spot route working Good ✅" });
});

router.use("/web", touristSpotRoute);
router.use("/app", touristSpotRoute);

export default router;
