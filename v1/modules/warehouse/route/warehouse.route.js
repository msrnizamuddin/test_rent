import express from "express";

import { validate } from "../../../middleware/validate.middleware.js";
import {
  createWarehouseValidation,
  updateWarehouseValidation,
} from "../validation/warehouse.validation.js";
import {
  createWarehouse,
  getAllWarehouses,
  getWarehouseByID,
  updateWarehouse,
} from "../controller/warehouse.controller.js";

const router = express.Router();

router.post("/", validate(createWarehouseValidation), createWarehouse);

router.get("/", getAllWarehouses);

router.get("/:id", getWarehouseByID);

router.patch("/:id", validate(updateWarehouseValidation), updateWarehouse);

export default router;
