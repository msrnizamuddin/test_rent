import { Router } from "express";
import inventoryRoute from "./inventory.route.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "inventory route working Good ✅",
  });
});

router.use("/", inventoryRoute);

export default router;