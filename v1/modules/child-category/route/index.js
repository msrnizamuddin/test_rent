import { Router } from "express";
import Childcategory from "./childCategory.route.js";
const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "child category route working Good ✅" });
});

router.use("/", Childcategory);

export default router;
