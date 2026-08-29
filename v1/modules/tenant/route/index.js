import { Router } from "express";
import tenant from "./tenant.route.js";
const router = Router();
router.get("/health", (req, res) => {
  res.json({ message: "Tenant route working Good ✅" });
})
router.use("/", tenant);
export default router;
