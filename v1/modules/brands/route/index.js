import { Router } from "express";
import BrandsRouter from "./brands.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Brands route working Good ✅" });
});

router.use("/", BrandsRouter);

export default router;
