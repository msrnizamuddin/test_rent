import { Router } from "express";
import vehicleCategoryRoute from "./vehicle-category.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Vehicle Category route working Good ✅" });
});

router.use("/web", vehicleCategoryRoute);
router.use("/app", vehicleCategoryRoute);

export default router;
