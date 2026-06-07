import { Router } from "express";
import { getAllTenant, updateTenant } from "../controller/tenant.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateTenantSchema } from "../validation/tenentValidation.js";
const router = Router();
router.get("/getTenant", getAllTenant);
router.patch("/updateTenant/:tenantId",validate(updateTenantSchema) , updateTenant);
export default router;