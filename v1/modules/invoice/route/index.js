import { Router } from "express";
import invoiceRoute from "./invoice.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Invoice route working Good ✅" });
});

router.use("/web", invoiceRoute);
router.use("/app", invoiceRoute);

export default router;
