import express from "express";

import {
  loginCustomerController,
} from "../../customer/controller/customer.controller.js";

import { logModule } from '../../../utils/moduleLogger.js';
logModule(import.meta.url);
import {
  loginCustomerValidation,
} from "../../customer/validation/customer.validation.js";
import { validate } from "../middleware/validate.middleware.js";
const customerRouter = express.Router();
customerRouter.post(
  "/login",
  validate(loginCustomerValidation),
  loginCustomerController
);
export default customerRouter;