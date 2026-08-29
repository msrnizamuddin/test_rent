import { Router } from "express";
import auth from "./auth.route.js";

import { logModule } from "../../../utils/moduleLogger.js";
import customerLoginRoute from "./customer.route.js";
logModule(import.meta.url);
const router = Router();

router.get("/health", (req, res) => {
  res.json({ message: "Auth route working Good ✅" });
});

router.use("/", auth);
router.use("/customer", customerLoginRoute);

export default router;
