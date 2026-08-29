import express from "express";

import * as controller from "../controller/account.transaction.controller.js";

import { validateParams } from "../../auth/middleware/validate.middleware.js";
import { validate } from "../../../middleware/validate.middleware.js";

import { createAccountTransactionValidation } from "../validation/account.transaction.validation.js";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
const router = express.Router();

router.post(
  "/",
  validate(createAccountTransactionValidation),
  controller.createAccountTransactionController,
);

router.get("/", controller.getAllAccountTransactionController);

router.get("/:id", controller.getSingleAccountTransactionController);

export default router;
