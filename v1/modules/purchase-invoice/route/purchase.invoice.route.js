import express from "express";

import * as controller from "../controller/purchase.invoice.controller.js";

import { validateParams } from "../../auth/middleware/validate.middleware.js";
import { validate } from "../../../middleware/validate.middleware.js";

import { createPurchaseInvoiceValidation } from "../validation/purchase.invoice.validation.js";

import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);

const router = express.Router();

router.post(
  "/",
  validate(createPurchaseInvoiceValidation),
  controller.createPurchaseInvoiceController,
);

router.get("/", controller.getAllPurchaseInvoiceController);

router.get("/:id", controller.getSinglePurchaseInvoiceController);

export default router;
