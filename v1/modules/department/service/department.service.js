import Department from "../model/department.model.js";

export const createDepartmentService = async (payload) => {
  const result = await Department.create({
    departmentName: payload.departmentName,
    departmentCode: payload.departmentCode,
    description: payload.description,
    createdBy: payload.createdBy || null,
    updatedBy: null,
  });
  return result;
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAllDepartmentService = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  // ---- Filter build ----
  const filter = {};

  if (search) {
    const safeSearch = escapeRegex(search.trim());
    filter.$or = [
      { departmentName: { $regex: safeSearch, $options: "i" } },
      { departmentCode: { $regex: safeSearch, $options: "i" } },
    ];
  }

  if (status) filter.status = status;

  if (isActive !== undefined) {
    filter.status = isActive === "true" ? "Active" : "Inactive";
  }

  // ---- Pagination (safe parsing) ----
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  // ---- Sort (whitelist দিয়ে safe করা, jate arbitrary field দিয়ে sort na kore) ----
  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "departmentName",
    "departmentCode",
    "status",
  ];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sort = { [safeSortBy]: sortOrder === "asc" ? 1 : -1 };

  // ---- Query + count parallel (Promise.all -> fast) ----
  const [data, total] = await Promise.all([
    Department.find(filter)
      .populate({ path: "createdBy", select: "-_id " })
      .populate({ path: "updatedBy", select: "-_id " })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select("-__v")
      .lean(),
    Department.countDocuments(filter),
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

export const getDepartmentByIdService = async (id) => {
  return await Department.findById(id)
    .populate({ path: "createdBy", select: "-_id " })
    .populate({ path: "updatedBy", select: "-_id " })
    .select("-__v")
    .lean();
};

export const updateDepartmentService = async (id, payload) => {
  const result = await Department.findByIdAndUpdate(id, payload, {
    returnDocument: "after",
    runValidators: true,
  });

  return result;
};
