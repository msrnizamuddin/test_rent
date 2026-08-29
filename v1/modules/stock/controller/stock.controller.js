import {
  createStockService,
  getStocksService,
  getStockByIdService,
  getInventoryBalanceService,
} from "../service/stock.service.js";
import tenantGetId from "../../../utils/tenentHalper.js";
export const createStock = async (req, res, next) => {
  try {
    const tenant = await tenantGetId(req.body.tenantId);

    if (!tenant) {
      throw new Error("Tenant not found");
    }
    req.body.tenantId = tenant._id;
    const result = await createStockService(req.body, req.user?._id);

    return res.status(201).json({
      success: true,
      message: "Stock transaction created successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllStocks = async (req, res, next) => {
  try {
    const result = await getStocksService(req.query);

    return res.status(200).json({
      success: true,
      message: "Stock transactions fetched successfully.",
      count: result.stocks.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await getStockByIdService(id);

    return res.status(200).json({
      success: true,
      message: "Stock transaction fetched successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getInventoryBalance = async (req, res, next) => {
  try {
    const { inventoryId } = req.params;

    const result = await getInventoryBalanceService(inventoryId);

    return res.status(200).json({
      success: true,
      message: "Inventory balance calculated successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export default {
  createStock,
  getAllStocks,
  getStockById,
  getInventoryBalance,
};
