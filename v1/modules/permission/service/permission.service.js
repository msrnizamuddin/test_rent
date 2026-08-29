import Permission from "../model/permission.model.js";

export const createPermissionService = async (payload) => {
  const permission = await Permission.create({
    permissionName: payload.permissionName,
    module: payload.module,
    action: payload.action,
    description: payload.description,
  });

  return permission;
};

// service
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAllPermissionService = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    module,
    action,
    centralStatus,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  // ---- Filter build ----
  const filter = {};

  if (search) {
    const safeSearch = escapeRegex(search.trim());
    filter.permissionName = { $regex: safeSearch, $options: "i" };
  }

  if (module) filter.module = module;
  if (action) filter.action = action;
  if (centralStatus) filter.centralStatus = centralStatus;

  // ---- Pagination (safe parsing) ----
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  // ---- Sort (whitelist) ----
  const allowedSortFields = [
    "permissionName",
    "module",
    "action",
    "createdAt",
    "updatedAt",
  ];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sort = { [safeSortBy]: sortOrder === "asc" ? 1 : -1 };

  // ---- Query + count parallel ----
  const [data, total] = await Promise.all([
    Permission.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select("-__v")
      .lean(),
    Permission.countDocuments(filter),
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

export const getPermissionByIdService = async (id) => {
  return await Permission.findById(id);
};

export const updatePermissionService = async (id, payload) => {
  const result = await Permission.findByIdAndUpdate(id, payload, {
    returnDocument: "after",
    runValidators: true,
  });

  return result;
};
