import { Router } from "express";
import inventoryRoute from "./inventory.route.js";
import { logModule } from '../../../utils/moduleLogger.js';
logModule(import.meta.url);
const router = Router();

router.get("/health", (req, res) => {
  res.json({
    message: "inventory route working Good ✅",
  });
});

router.use("/", inventoryRoute);

export default router;