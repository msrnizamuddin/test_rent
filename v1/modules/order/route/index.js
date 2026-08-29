import { Router } from "express";
import orderRoutes from "./order.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Order Route is working perfectly! ✅",
  });
});

router.use("/", orderRoutes);

export default router;
