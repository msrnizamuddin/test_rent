import { Router } from "express";
import documentRoute from "./document.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Document route working Good ✅" });
});

router.use("/web", documentRoute);
router.use("/app", documentRoute);

export default router;
