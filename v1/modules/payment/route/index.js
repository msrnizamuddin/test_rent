import { Router } from "express";
import paymentRoute from "./payment.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Payment route working Good ✅" });
});

router.use("/web", paymentRoute);
router.use("/app", paymentRoute);

export default router;
