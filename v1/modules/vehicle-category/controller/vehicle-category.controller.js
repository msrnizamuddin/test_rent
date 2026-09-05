import vehicleCategoryService from "../service/vehicle-category.service.js";

const handle = (fn) => async (req, res, next) => {
  try {
    const result = await fn(req, res);
    res.status(result.statusCode || 200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const searchCategories = handle(async (req) => {
  const data = await vehicleCategoryService.searchCategories(req.query);
  return { message: "Vehicle categories fetched successfully", data };
});

// Safe "get everything" — no filters, no conditions.
export const getAll = handle(async () => {
  const data = await vehicleCategoryService.getAll();
  return { message: "All vehicle categories fetched successfully", data };
});

export const getCategoryById = handle(async (req) => {
  const data = await vehicleCategoryService.getCategoryById(req.params.categoryId);
  return { message: "Vehicle category fetched successfully", data };
});

export const createCategory = handle(async (req) => {
  const data = await vehicleCategoryService.createCategory(req.body);
  return { statusCode: 201, message: "Vehicle category created successfully", data };
});

export const updateCategory = handle(async (req) => {
  const data = await vehicleCategoryService.updateCategory(req.params.categoryId, req.body);
  return { message: "Vehicle category updated successfully", data };
});

export const deleteCategory = handle(async (req) => {
  const data = await vehicleCategoryService.deleteCategory(req.params.categoryId);
  return { message: "Vehicle category deleted successfully", data };
});
