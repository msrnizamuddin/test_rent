import VehicleCategory from "../model/vehicle-category.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const searchCategories = async (query) => {
  return VehicleCategory.search(query);
};

const getCategoryById = async (categoryId) => {
  const category = await VehicleCategory.findById(categoryId);
  if (!category) throw buildError("Category not found", 404);
  return category;
};

const createCategory = async (payload) => {
  const existing = await VehicleCategory.findByName(payload.name);
  if (existing) throw buildError("Category name already exists", 409);

  return VehicleCategory.create(payload);
};

const updateCategory = async (categoryId, payload) => {
  if (payload.name) {
    const existing = await VehicleCategory.findByName(payload.name, categoryId);
    if (existing) throw buildError("Category name already in use", 409);
  }

  const category = await VehicleCategory.updateById(categoryId, payload);
  if (!category) throw buildError("Category not found", 404);
  return category;
};

const deleteCategory = async (categoryId) => {
  try {
    const deleted = await VehicleCategory.deleteById(categoryId);
    if (!deleted) throw buildError("Category not found", 404);
    return { deleted: true };
  } catch (error) {
    if (error.code === "23503") {
      throw buildError("Category is in use by existing vehicles", 409);
    }
    throw error;
  }
};

export default {
  searchCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
