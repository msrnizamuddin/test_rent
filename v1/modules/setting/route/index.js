import { Router } from "express";
import settingRoute from "./setting.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Setting route working Good ✅" });
});

router.use("/web", settingRoute);
router.use("/app", settingRoute);

export default router;
