import {
  createInventoryService,
  getAllInventoryService,
  getInventoryByIdService,
  updateInventoryService,
  deleteInventoryService,
} from "../service/inventory.service.js";
import { logModule } from '../../../utils/moduleLogger.js';
logModule(import.meta.url);
export const createInventory = async (req, res) => {
  try {
    const result = await createInventoryService(req.body);

    res.status(201).json({
      success: true,
      message: "Inventory created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllInventories = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getAllInventoryService(page, limit);

    res.status(200).json({
      success: true,
      message: "Inventories fetched successfully",
      data: result.inventories,
      meta: result.meta,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getInventoryByIdService(id);

    res.status(200).json({
      success: true,
      message: "Inventory fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await updateInventoryService(
      id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteInventoryService(id);

    res.status(200).json({
      success: true,
      message: "Inventory deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};