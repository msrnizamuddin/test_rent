import { Router } from "express";
import mapsRoute from "./maps.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Maps route working Good ✅" });
});

router.use("/web", mapsRoute);
router.use("/app", mapsRoute);

export default router;
