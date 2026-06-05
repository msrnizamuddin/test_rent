import { Router } from "express";
import warehouseRoute from "./warehouse.route.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "warehouse route working Good ✅" });
});


router.use("/", warehouseRoute);

export default router;