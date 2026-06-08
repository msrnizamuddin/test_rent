console.log("inventory.route.js loaded");

import express from "express";

import * as controller from "../controller/inventory.controller.js";

import { validate, validateParams } from "../../auth/middleware/validate.middleware.js";

import {
  createInventoryValidation,
  updateInventoryValidation,
  deleteInventoryValidation,
} from "../validation/inventory.validation.js";

const router = express.Router();

router.get(
  "/ping",
  (req, res) => {
    res.status(200).json({
      message: "Module is alive!",
    });
  },
);

router.post(
  "/create",
  validate(createInventoryValidation),
  controller.createInventory,
);

router.get(
  "/all",
  controller.getAllInventories,
);

router.get(
  "/:id",
  controller.getInventoryById,
);

router.patch(
  "/:id",
  validate(updateInventoryValidation),
  controller.updateInventory,
);

router.delete(
  "/delete/:id",
  validateParams(deleteInventoryValidation),
  controller.deleteInventory,
);

export default router;