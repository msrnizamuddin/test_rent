import express from "express";
import {
  createPermission,
  getAllPermission,
  getPermissionById,
  updatePermission,
} from "../controller/permission.controller.js";
import { validate } from "../../../middleware/validate.middleware.js"
import {
  createPermissionSchema,
  updatePermissionSchema,
} from "../validation/permission.validation.js";
const router = express.Router();

router.post("/", validate(createPermissionSchema), createPermission);
router.get("/", getAllPermission);
router.get("/:id", getPermissionById);
router.patch("/:id", validate(updatePermissionSchema), updatePermission);

export default router;
