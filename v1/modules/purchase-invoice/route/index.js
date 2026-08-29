import { Router } from "express";
import purchaseInvoiceRoute from "./purchase.invoice.route.js";

import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    message: "purchase invoice route working Good ✅",
  });
});

router.use("/", purchaseInvoiceRoute);

export default router;
