import Permission from "../../permission/model/permission.model.js";
import Role from "../model/role.model.js";

export const createRoleService = async (payload) => {
  const { roleName, description, permissions = [] } = payload;

  // ---- Permission gulo exist kore kina check ----
  if (permissions.length > 0) {
    const foundPermissions = await Permission.find({
      _id: { $in: permissions },
    }).select("_id");

    if (foundPermissions.length !== permissions.length) {
      const error = new Error("One or more permissions not found");
      error.statusCode = 404;
      throw error;
    }
  }
  const role = await Role.create({
    roleName,
    description,
    permissions,
  });

  return role;
};

// service
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAllRoleService = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    currentStatus,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  // ---- Filter build ----
  const filter = {};

  if (search) {
    const safeSearch = escapeRegex(search.trim());
    filter.roleName = { $regex: safeSearch, $options: "i" };
  }

  if (currentStatus) filter.currentStatus = currentStatus;

  // ---- Pagination (safe parsing) ----
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  // ---- Sort (whitelist) ----
  const allowedSortFields = [
    "roleName",
    "createdAt",
    "updatedAt",
    "currentStatus",
  ];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sort = { [safeSortBy]: sortOrder === "asc" ? 1 : -1 };

  // ---- Query + count parallel ----
  const [data, total] = await Promise.all([
    Role.find(filter)
      .populate({
        path: "permissions",
        select: "_id permissionName module action",
      })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select("-__v")
      .lean(),
    Role.countDocuments(filter),
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
export const getRoleByIdService = async (id) => {
  return await Role.findById(id)
    .populate({
      path: "permissions",
      select: "_id permissionName module action",
    })
    .select("-__v")
    .lean();
};

export const updateRoleService = async (id, payload) => {
  const result = await Role.findByIdAndUpdate(id, payload, {
    returnDocument: "after",
    runValidators: true,
  });

  return result;
};
