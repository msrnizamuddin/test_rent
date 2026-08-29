import tenantGetId from "../../../utils/tenentHalper.js";
import {
  createWarehouseService,
  getAllWarehouseService,
  getWarehouseByIDService,
  updateWarehouseService,
} from "../service/warehouse.services.js";

export const createWarehouse = async (req, res, next) => {
  try {
    const tenant = await tenantGetId(req.body.tenantId);
    if (!tenant) {
      return res.status(404).json({
        status: false,
        message: "Tenant not found",
        data: null,
      });
    }

    const result = await createWarehouseService(req.body, tenant);
    res.status(201).json({
      success: true,
      message: "Warehouse created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllWarehouses = async (req, res, next) => {
  try {
    const result = await getAllWarehouseService(req.query);
    res.status(200).json({
      success: true,
      message: "Warehouse fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getWarehouseByID = async (req, res, next) => {
  const id = req.params.id;

  try {
    const result = await getWarehouseByIDService(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Specific Warehouse fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWarehouse = async (req, res, next) => {
  const data = req.body;
  const id = req.params.id;
  try {
    const result = await updateWarehouseService(id, data);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Warehouse updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};