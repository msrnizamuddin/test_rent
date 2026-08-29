import SubCategory from "../model/subCategory.model.js";
import Category from "../../category/model/category.model.js";
import mongoose from "mongoose";
export const createSubCategoryService = async (payload, tenant) => {
  const category = await Category.findById(payload.categoryId);
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  const subCategory = await SubCategory.create({
    tenantId: tenant._id,
    categoryId: category._id,
    type: payload.type,
    name: payload.name,
    slug: payload.slug,
    coverImage: payload.coverImage,
    profileImage: payload.profileImage,
    createdBy: tenant._id,
    updatedBy: null,
  });
  return subCategory;
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAllSubCatecoryService = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    tenantId,
    categoryId,
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  // ---- Filter build ----
  const filter = {};

  if (status) filter.status = status;
  if (tenantId) filter.tenantId = tenantId;
  if (categoryId) filter.categoryId = categoryId;
  if (isActive !== undefined) {
    filter.status = isActive === "true" ? "active" : "inactive";
  }

  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$expr = {
      $anyElementTrue: {
        $map: {
          input: {
            $cond: [
              { $eq: [{ $type: "$name" }, "object"] },
              { $objectToArray: "$name" },
              [],
            ],
          },
          as: "n",
          in: {
            $regexMatch: {
              input: { $ifNull: ["$$n.v", ""] },
              regex: safeSearch,
              options: "i",
            },
          },
        },
      },
    };
  }

  // ---- Pagination (safe parsing) ----
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  // ---- Sort ----
  const allowedSortFields = ["createdAt", "updatedAt", "status"];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sort = { [safeSortBy]: sortOrder === "asc" ? 1 : -1 };

  // ---- Query + count parallel ----
  const [data, total] = await Promise.all([
    SubCategory.find(filter)
      .populate({ path: "tenantId", select: "-_id -__v" })
      .populate({ path: "categoryId", select: "-__v" })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select("-__v")
      .lean(),
    SubCategory.countDocuments(filter),
  ]);

  return {
    data,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum * limitNum < total,
      hasPrevPage: pageNum > 1,
    },
  };
};

export const getSubCategoryByIDService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid Sub-Category ID");
    error.statusCode = 400;
    throw error;
  }

  const doc = await SubCategory.findById(id)
    .populate({ path: "tenantId", select: "-_id -__v" })
    .populate({ path: "categoryId", select: "-__v" })
    .select("-__v")
    .lean();

  return doc;
};

export const updateSubCategoryService = async (id, payload) => {
  const doc = await SubCategory.findByIdAndUpdate(id, payload, {
    returnDocument: "after",
    runValidators: true,
  });
  return doc;
};
