import mongoose from "mongoose";
import Tenant from "../model/tenant.model.js";

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const getAllTenantService = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    centralStatus,
    isVerified,
    languageId,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  // ---- Filter build ----
  const filter = {};

  if (centralStatus) filter.centralStatus = centralStatus;
  if (isVerified !== undefined) filter.isVerified = isVerified === "true";
  if (languageId) filter.languages = languageId; // specific language দিয়ে tenant filter

  if (search) {
    const safeSearch = escapeRegex(search);
    const regex = new RegExp(safeSearch, "i");
    filter.$or = [
      { fullName: regex },
      { businessName: regex },
      { businessEmail: regex },
      { businessPhone: regex },
    ];
  }

  // ---- Pagination (safe parsing) ----
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  // ---- Sort ----
  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "fullName",
    "businessName",
    "centralStatus",
  ];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sort = { [safeSortBy]: sortOrder === "asc" ? 1 : -1 };

  // ---- Query + count parallel ----
  const [data, total] = await Promise.all([
    Tenant.find(filter)
      .select("-__v")
      .populate({ path: "languages", select: "name code _id" }) // Language model অনুযায়ী field adjust করো
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Tenant.countDocuments(filter),
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

export const updateTenantService = async (id, updates, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid tenant ID");
    error.statusCode = 400;
    throw error;
  }

  if (userId) updates.updatedBy = userId;

  const tenant = await Tenant.findByIdAndUpdate(id, updates, {
    returnDocument: "after",
    runValidators: true,
    context: "query",
  }).lean();

  if (!tenant) {
    const error = new Error("Tenant not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    status: 200,
    success: true,
    message: "Tenant updated successfully",
    data: tenant,
  };
};
