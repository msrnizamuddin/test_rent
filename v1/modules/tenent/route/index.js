import { Router } from "express";
import createTenant, { getAllTenant, updateTenant } from "../controller/createTenant.js";
import { validateTenant } from "../validation/tenentValidation.js";
const router = Router();

router.post("/createTenant",validateTenant, createTenant);
router.get("/getTenant", getAllTenant);
router.patch("/updateTenant/:tenantId",  updateTenant);

export default router;
