import { Router } from "express";
import auth from "./auth.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Auth route working Good ✅" });
});

// Every endpoint below is exposed twice — once for the web app (Super
// Admin / Manager panel) and once for the mobile app (User / Driver) — so
// each client can be versioned, throttled, or restricted independently
// without touching the other. Same controllers/services underneath.
router.use("/web", auth);
router.use("/app", auth);

export default router;
