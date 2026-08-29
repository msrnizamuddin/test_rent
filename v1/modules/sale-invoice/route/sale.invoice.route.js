import express from "express";

import * as controller from "../controller/sale.invoice.controller.js";

import { validateParams } from "../../auth/middleware/validate.middleware.js";
import { validate } from "../../../middleware/validate.middleware.js";

import { createSaleInvoiceValidation } from "../validation/sale.invoice.validation.js";

import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);

const router = express.Router();

router.post(
  "/",
  validate(createSaleInvoiceValidation),
  controller.createSaleInvoiceController,
);

router.get("/", controller.getAllSaleInvoiceController);

router.get("/:id", controller.getSingleSaleInvoiceController);

export default router;
