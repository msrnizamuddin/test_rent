import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "customers route working Good ✅" });
});

export default router;
