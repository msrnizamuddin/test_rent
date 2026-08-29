import {
  createOrderService,
  getOrderByIdService,
  getOrdersService,
  updateOrderService,
  updateOrderStatusService,
  updateTenantOrderStatusService,
} from "../service/order.service.js";
import tenantGetId from "../../../utils/tenentHalper.js";

export const createOrder = async (req, res, next) => {
  try {
    const result = await createOrderService(req.body, req.customerId);

    return res.status(201).json({
      success: true,
      message: "Order created successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const result = await getOrdersService(req.query, req.customerId);

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully.",
      count: result.orders.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const result = await getOrderByIdService(req.params.id, req.customerId);

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const result = await updateOrderService(
      req.params.id,
      req.body,
      req.customerId,
    );

    return res.status(200).json({
      success: true,
      message: "Order updated successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const result = await updateOrderStatusService(
      req.params.id,
      req.body,
      req.user?._id,
    );

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTenantOrderStatus = async (req, res, next) => {
  try {
    const { orderId, tenantId } = req.params;

    const tenant = await tenantGetId(tenantId);

    if (!tenant) {
      throw new Error("Tenant not found.");
    }

    const result = await updateTenantOrderStatusService(
      orderId,
      tenant._id,
      req.body,
      req.user?._id,
    );

    return res.status(200).json({
      success: true,
      message: "Tenant order status updated successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getManagementOrders = async (req, res, next) => {
  try {
    const result = await getOrdersService(req.query);

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully.",
      count: result.orders.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export default {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  updateTenantOrderStatus,
  getManagementOrders,
};
