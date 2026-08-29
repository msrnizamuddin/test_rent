import { Router } from "express";

import stockRoute from "./stock.route.js";

import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    message: "Stock route working Good ✅",
  });
});

router.use("/", stockRoute);

export default router;
