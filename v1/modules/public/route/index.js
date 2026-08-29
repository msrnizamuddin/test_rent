import { Router } from "express";
import publicRouter from "./public.route.js";
const router = Router();
router.get("/", (req, res) => {
  res.json({ message: "public route working Good ✅" });
});
router.use("/", publicRouter);
export default router;
