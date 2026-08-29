import { Router } from "express";
import accountTransactionRoute from "./account.transaction.route.js";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
const router = Router();

router.get("/health", (req, res) => {
  res.json({
    message: "account transaction route working Good ✅",
  });
});

router.use("/", accountTransactionRoute);

export default router;
