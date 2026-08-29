import express from "express";

import * as controller from "../controller/inventory.controller.js";

import { validateParams } from "../../auth/middleware/validate.middleware.js";
import { validate } from "../../../middleware/validate.middleware.js";

import {
  createInventoryValidation,
  updateInventoryValidation,
  deleteInventoryValidation,
} from "../validation/inventory.validation.js";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
const router = express.Router();

router.post(
  "/",
  validate(createInventoryValidation),
  controller.createInventory,
);

router.get("/", controller.getAllInventories);

router.get("/:id", controller.getInventoryById);

router.patch(
  "/:id",
  validate(updateInventoryValidation),
  controller.updateInventory,
);

router.delete(
  "/:id",
  validateParams(deleteInventoryValidation),
  controller.deleteInventory,
);

export default router;
