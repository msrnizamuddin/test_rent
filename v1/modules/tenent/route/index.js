import { Router } from "express";
import createTenant, { getAllTenant, updateTenant } from "../controller/createTenant.js";
const router = Router();

router.post("/createTenant", createTenant);
router.get("/getTenant", getAllTenant);
router.patch("/updateTenant/:tenantId", updateTenant);

export default router;
