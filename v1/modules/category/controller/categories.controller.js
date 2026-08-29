import tenantGetId from "../../../utils/tenentHalper.js";
import {
  createCategoryService,
  getAllCatecoryService,
  getCategoryByIDService,
  updateCategoryService,
} from "../service/category.service.js";

export const createCategory = async (req, res, next) => {
  try {
    const tenant = await tenantGetId(req.body.tenantId);
    if (!tenant) {
      return res.status(404).json({
        status: false,
        message: "Tenant not found",
        data: null,
      });
    }

    const result = await createCategoryService(req.body, tenant);
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCaterogires = async (req, res, next) => {
  try {
    const result = await getAllCatecoryService(req.query);
    res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryByID = async (req, res, next) => {
  const id = req.params.id;

  try {
    const result = await getCategoryByIDService(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Specific Category fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  const data = req.body;
  const id = req.params.id;
  try {
    const result = await updateCategoryService(id, data);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
