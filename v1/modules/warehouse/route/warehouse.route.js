console.log("warehouse.route.js loaded");
import express from "express";

import * as controller from "../controller/warehouse.controller.js";

import { validate } from "../../auth/middleware/validate.middleware.js";

import {
  createWarehouseValidation,
} from "../validation/warehouse.validation.js";

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
  "/",
  validate(createWarehouseValidation),
  controller.createWarehouse,
);

router.get(
  "/",
  controller.getAllWarehouse,
);

export default router;