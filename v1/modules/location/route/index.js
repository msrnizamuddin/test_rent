import { Router } from "express";
import locationRoute from "./location.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Location route working Good ✅" });
});

router.use("/web", locationRoute);
router.use("/app", locationRoute);

export default router;
