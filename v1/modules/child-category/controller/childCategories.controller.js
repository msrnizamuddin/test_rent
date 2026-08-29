import tenantGetId from "../../../utils/tenentHalper.js";
import {
  createChildCategoryService,
  getAllChildCatecoryService,
  getChildCategoryByIDService,
  updateChildCategoryService,
} from "../service/childcategory.service.js";

export const createChildCategory = async (req, res, next) => {
  try {
    const tenant = await tenantGetId(req.body.tenantId);
    if (!tenant) {
      return res.status(404).json({
        status: false,
        message: "Tenant not found",
        data: null,
      });
    }

    const result = await createChildCategoryService(req.body, tenant);
    res.status(201).json({
      success: true,
      message: "Child Category created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllChildCaterogires = async (req, res, next) => {
  try {
    const result = await getAllChildCatecoryService(req.query);
    res.status(200).json({
      success: true,
      message: "Child-Category fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getChildCategoryByID = async (req, res, next) => {
  const id = req.params.id;

  try {
    const result = await getChildCategoryByIDService(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Child-Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Specific Child-Category fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateChildCategory = async (req, res, next) => {
  const data = req.body;
  const id = req.params.id;
  try {
    const result = await updateChildCategoryService(id, data);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Child-Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Specific Child-Category Updated successfully",
      data: result,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};
