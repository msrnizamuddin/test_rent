import tenantGetId from "../../../utils/tenentHalper.js";
import {
  createSubCategoryService,
  getAllSubCatecoryService,
  getSubCategoryByIDService,
  updateSubCategoryService,
} from "../service/subcategory.service.js";

export const createSubCategory = async (req, res, next) => {
  try {
    const tenant = await tenantGetId(req.body.tenantId);
    if (!tenant) {
      return res.status(404).json({
        status: false,
        message: "Tenant not found",
        data: null,
      });
    }

    const result = await createSubCategoryService(req.body, tenant);
    res.status(201).json({
      success: true,
      message: "Sub-Category created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSUbCaterogires = async (req, res, next) => {
  try {
    const result = await getAllSubCatecoryService(req.query);

    res.status(200).json({
      success: true,
      message: "Sub-Category fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubCategoryByID = async (req, res, next) => {
  const id = req.params.id;

  try {
    const result = await getSubCategoryByIDService(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Sub-Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Specific Sub-Category fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubCategory = async (req, res, next) => {
  const data = req.body;
  const id = req.params.id;

  try {
    const result = await updateSubCategoryService(id, data);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Sub-Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Specific Sub-Category Updated successfully",
      data: result,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};
