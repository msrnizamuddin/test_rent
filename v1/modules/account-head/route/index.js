import { Router } from "express";
import accountHeadRoute from "./account.head.route.js";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
const router = Router();

router.get("/health", (req, res) => {
  res.json({
    message: "account head route working Good ✅",
  });
});

router.use("/", accountHeadRoute);

export default router;
