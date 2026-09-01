import { Router } from "express";
import notificationRoute from "./notification.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Notification route working Good ✅" });
});

// Same endpoints exposed twice — once for the web app (Super Admin /
// Manager panel), once for the mobile app (User / Driver) — so each
// client can be versioned or restricted independently.
router.use("/web", notificationRoute);
router.use("/app", notificationRoute);

export default router;
