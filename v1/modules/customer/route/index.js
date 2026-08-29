import express from "express";

import customerRouter from "./customer.route.js";
import { logModule } from '../../../utils/moduleLogger.js';
logModule(import.meta.url);
const router = express.Router();
router.get("/health", (req, res) => {
  res.json({ message: "Customer route working Good ✅" });
});
router.use("/", customerRouter);

export default router;