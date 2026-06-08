import {
  createWarehouseService,
  getAllWarehouseService,
  getWarehouseByIdService,
  updateWarehouseService,
} from "../service/warehouse.services.js";

export const createWarehouse = async (req, res) => {
  try {
    const warehouse = await createWarehouseService(
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Warehouse created successfully",
      data: warehouse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllWarehouse = async (req, res) => {
  try {
    const warehouses =
      await getAllWarehouseService();

    res.status(200).json({
      success: true,
      data: warehouses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getWarehouseById = async (
  req,
  res,
) => {
  try {
    const { id } = req.params;

    const warehouse =
      await getWarehouseByIdService(id);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    res.status(200).json({
      success: true,
      data: warehouse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    const warehouse = await updateWarehouseService(
      id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Warehouse updated successfully",
      data: warehouse,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};