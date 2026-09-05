import { Router } from "express";
import auditLogRoute from "./audit-log.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Audit Log route working Good ✅" });
});

// Super Admin panel only — no /app mount.
router.use("/web", auditLogRoute);

export default router;
