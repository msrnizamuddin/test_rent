import { Router } from "express";
import warehouseRoute from "./warehouse.route.js";
import { logModule } from '../../../utils/moduleLogger.js';
logModule(import.meta.url);
const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "warehouse route working Good ✅" });
});


router.use("/", warehouseRoute);

export default router;