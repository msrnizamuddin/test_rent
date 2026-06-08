import { Router } from "express";
import tenant from "./tenant.route.js";
const router = Router();
router.use("/", tenant);
export default router;
