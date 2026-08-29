import express from "express";
import {
  createCustomerController,
  getAllCustomersController,
  getCustomerByIdController,
  updateCustomerController,
  addCustomerAddressController,
  updateCustomerAddressController,
  deleteCustomerAddressController,
} from "../controller/customer.controller.js";
import {
  createCustomerValidation,
  updateCustomerValidation,
  addCustomerAddressValidation,
  updateCustomerAddressValidation,
} from "../validation/customer.validation.js";
import { validate } from "../../../middleware/validate.middleware.js";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
const customerRouter = express.Router();
customerRouter.post(
  "/",
  validate(createCustomerValidation),
  createCustomerController,
);
customerRouter.get("/", getAllCustomersController);
customerRouter.post(
  "/:id/addresses",
  validate(addCustomerAddressValidation),
  addCustomerAddressController,
);
customerRouter.patch(
  "/:id/addresses/:addressId",
  validate(updateCustomerAddressValidation),
  updateCustomerAddressController,
);
customerRouter.delete(
  "/:id/addresses/:addressId",
  deleteCustomerAddressController,
);
customerRouter.get("/:id", getCustomerByIdController);
customerRouter.patch(
  "/:id",
  validate(updateCustomerValidation),
  updateCustomerController,
);
export default customerRouter;
