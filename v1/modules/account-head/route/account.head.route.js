import express from "express";
import * as controller from "../controller/account.head.controller.js";
import { validateParams } from "../../auth/middleware/validate.middleware.js";
import { validate } from "../../../middleware/validate.middleware.js";
import {
  createAccountHeadValidation,
  updateAccountHeadValidation,
} from "../validation/account.head.validation.js";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
const router = express.Router();

router.post(
  "/",
  validate(createAccountHeadValidation),
  controller.createAccountHeadController,
);

router.get("/", controller.getAllAccountHeadController);

router.get("/:id", controller.getSingleAccountHeadController);

router.patch(
  "/:id",
  validate(updateAccountHeadValidation),
  controller.updateAccountHeadController,
);

export default router;
