import { Router } from "express";
import saleInvoiceRoute from "./sale.invoice.route.js";

import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    message: "sale invoice route working Good ✅",
  });
});

router.use("/", saleInvoiceRoute);

export default router;
