import { Router } from "express";
import auth from "./auth.route.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Auth route working Good ✅" });
});

router.use("/", auth);

export default router;
