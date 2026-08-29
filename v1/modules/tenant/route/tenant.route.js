import { Router } from "express";
import { getAllTenant, updateTenant } from "../controller/tenant.controller.js";
import { updateTenantSchema } from "../validation/tenentValidation.js";
import { validate } from "../../../middleware/validate.middleware.js";
const router = Router();
router.get("/", getAllTenant);

router.patch("/:id",validate(updateTenantSchema) , updateTenant);
export default router;