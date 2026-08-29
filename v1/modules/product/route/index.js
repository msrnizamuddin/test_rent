import { Router } from "express";
import productRoutes from "./product.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Product Route is working perfectly! ✅",
  });
});

router.use("/", productRoutes);

export default router;
