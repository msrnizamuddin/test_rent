import { Router } from "express";
import tenant from "./tenant.route.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "tenant route working Good ✅" });
});

router.use("/", tenant);

export default router;
