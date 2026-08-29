import Product from "../model/product.model.js";
import Inventory from "../../inventory/model/inventory.model.js";
import tenantGetId from "../../../utils/tenentHalper.js";
import {
  createProductWithInventoryService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
} from "../service/product.service.js";

export const createProduct = async (req, res, next) => {
  try {
    const tenant = await tenantGetId(req.body.tenantId);

    if (!tenant) {
      throw new Error("Tenant not found");
    }
    const { tenantId } = req.body;
    let { inventories, ...productData } = req.body;
    if (typeof inventories === "string") {
      inventories = JSON.parse(inventories);
    }

    if (!Array.isArray(inventories) || inventories.length === 0) {
      const err = new Error(
        "At least one inventory item (size/variant) is required.",
      );
      err.statusCode = 400;
      return next(err);
    }

    const skuSet = new Set();

    for (const inv of inventories) {
      if (!inv.sku || !inv.sizeId || !inv.warehouseId) {
        const err = new Error(
          "SKU, sizeId, and warehouseId are required for every variant.",
        );
        err.statusCode = 400;
        return next(err);
      }

      if (inv.basePrice < 0 || inv.productPurchasePrice < 0) {
        const err = new Error(
          `Prices cannot be negative. Check SKU: ${inv.sku}`,
        );
        err.statusCode = 400;
        return next(err);
      }

      if (skuSet.has(inv.sku)) {
        const err = new Error(
          `Duplicate SKU found in your request: ${inv.sku}`,
        );
        err.statusCode = 400;
        return next(err);
      }

      skuSet.add(inv.sku);
    }

    const existingSlug = await Product.exists({
      productSlug: productData.productSlug,
      tenantId: tenant._id,
    });

    if (existingSlug) {
      const err = new Error("A product with this slug already exists.");
      err.statusCode = 400;
      return next(err);
    }

    const existingSku = await Inventory.exists({
      sku: { $in: [...skuSet] },
      tenantId: tenant._id,
    });

    if (existingSku) {
      const err = new Error(
        "One or more SKUs in your request already exist in the system.",
      );
      err.statusCode = 400;
      return next(err);
    }

    productData.tenantId = tenantId;

    const result = await createProductWithInventoryService(
      productData,
      inventories,
      tenant._id,
    );

    return res.status(201).json({
      success: true,
      message: "Product and inventories created successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const result = await getAllProductsService(req.query);
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await getProductByIdService(id);

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await updateProductService(id, updateData);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
};
