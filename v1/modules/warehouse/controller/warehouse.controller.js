import {
  createWarehouseService,
  getAllWarehouseService,
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

export const getAllWarehouse = async (
  req,
  res,
) => {
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