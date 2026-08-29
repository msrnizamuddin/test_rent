import express from "express";
import * as controller from "../controller/stock.controller.js";
import { validateParams } from "../../auth/middleware/validate.middleware.js";
import { validate } from "../../../middleware/validate.middleware.js";
import { createStockValidation } from "../validation/stock.validation.js";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);

const router = express.Router();

router.post("/", validate(createStockValidation), controller.createStock);

router.get("/", controller.getAllStocks);

router.get("/balance/:inventoryId", controller.getInventoryBalance);

router.get("/:id", controller.getStockById);

// No PATCH route.
// Stock transactions should never be edited.

export default router;
