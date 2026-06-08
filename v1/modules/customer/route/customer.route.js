import express from "express";
import {
  createCustomerController,
  getAllCustomersController,
  getCustomerByIdController,
  updateCustomerController,
} from "../controller/customer.controller.js";
import {
  createCustomerValidation,
  updateCustomerValidation,
} from "../validation/customer.validation.js";
import { validate } from "../../auth/middleware/validate.middleware.js";
const customerRouter = express.Router();
customerRouter.post(
  "/create",
  validate(createCustomerValidation),
  createCustomerController
);
customerRouter.get(
  "/all",
  getAllCustomersController
);
customerRouter.get(
  "/:id",
  getCustomerByIdController
);
customerRouter.put(
  "/:id",
  validate(updateCustomerValidation),
  updateCustomerController
);
export default customerRouter;