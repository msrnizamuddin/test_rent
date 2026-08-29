import Department from "../../department/model/department.model.js";
import Designation from "../model/designation.model.js";

export const createDesignationService = async (payload) => {
  const department = await Department.findOne({ _id: payload.department });
  if (!department) {
    const error = new Error("Department not found");
    error.statusCode = 404;
    throw error;
  }

  const result = await Designation.create({
    title: payload.title,
    department: department._id,
    description: payload.description,
    centralStatus: payload.centralStatus,
    createdBy: payload.createdBy || null,
    updatedBy: null,
  });
  return result;
};

// service
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getDesignationService = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    department,
    centralStatus,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  // ---- Filter build ----
  const filter = {};

  if (search) {
    const safeSearch = escapeRegex(search.trim());
    filter.title = { $regex: safeSearch, $options: "i" };
  }

  if (department) filter.department = department;
  if (centralStatus) filter.centralStatus = centralStatus;

  // ---- Pagination (safe parsing) ----
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  // ---- Sort (whitelist) ----
  const allowedSortFields = [
    "title",
    "createdAt",
    "updatedAt",
    "centralStatus",
  ];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sort = { [safeSortBy]: sortOrder === "asc" ? 1 : -1 };

  // ---- Query + count parallel ----
  const [data, total] = await Promise.all([
    Designation.find(filter)
      .populate({
        path: "department",
        select: "_id departmentName departmentCode",
      })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select("-__v")
      .lean(),
    Designation.countDocuments(filter),
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
export const getDesignationByIdService = async (id) => {
  const result = await Designation.findById(id)
    .populate({
      path: "department",
      select: "_id departmentName departmentCode",
    })
    .lean();
  return result;
};

export const updateDesignationService = async (id, payload) => {
  const result = await Designation.findByIdAndUpdate(id, payload, {
    returnDocument: "after",
    runValidators: true,
  });

  return result;
};
