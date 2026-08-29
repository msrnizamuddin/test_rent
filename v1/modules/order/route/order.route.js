import { Router } from "express";

import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  updateTenantOrderStatus,
  getManagementOrders,
} from "../controller/order.controller.js";

import {
  createOrderValidation,
  updateOrderValidation,
  updateOrderStatusValidation,
  updateTenantOrderStatusValidation,
} from "../validation/order.validation.js";

import { validate } from "../../auth/middleware/validate.middleware.js";
import customerAuthMiddleware from "../../../middleware/customerAuthMiddleware.js";
import optionalCustomerAuthMiddleware from "../../../middleware/optionalCustomerAuthMiddleware.js";

const orderRouter = Router();

orderRouter.post(
  "/",
  optionalCustomerAuthMiddleware(),
  validate(createOrderValidation),
  createOrder,
);

orderRouter.get("/management", getManagementOrders);

orderRouter.get("/", customerAuthMiddleware(), getOrders);

orderRouter.get("/:id", customerAuthMiddleware(), getOrderById);

orderRouter.patch(
  "/:id",
  customerAuthMiddleware(),
  validate(updateOrderValidation),
  updateOrder,
);

orderRouter.patch(
  "/:id/status",
  validate(updateOrderStatusValidation),
  updateOrderStatus,
);

orderRouter.patch(
  "/:orderId/tenant/:tenantId",
  validate(updateTenantOrderStatusValidation),
  updateTenantOrderStatus,
);

export default orderRouter;
