import express from "express";
import {
  createRole,
  getAllRole,
  getRoleById,
  updateRole,
} from "../controller/role.controller.js";
import { validate } from "../../../middleware/validate.middleware.js";
import { createRoleSchema, updateRoleSchema } from "../validation/role.validation.js";


const router = express.Router();

router.post("/", validate(createRoleSchema),  createRole);
router.get("/", getAllRole);
router.get("/:id", getRoleById);
router.patch("/:id", validate(updateRoleSchema),  updateRole);

export default router;
