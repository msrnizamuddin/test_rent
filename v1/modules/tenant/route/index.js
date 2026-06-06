import { Router } from "express";
import { getAllTenant, updateTenant } from "../controller/tenant.controller.js";
import { validateUpdateTenant } from "../validation/tenentValidation.js";
const router = Router();

router.get("/getTenant", getAllTenant);
router.patch("/updateTenant/:tenantId", validateUpdateTenant, updateTenant);

export default router;
