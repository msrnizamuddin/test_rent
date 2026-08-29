import Warehouse from "../model/warehouse.model.js";
import mongoose from "mongoose";

export const createWarehouseService = async (payload, tenant) => {
  const warehouse = await Warehouse.create({
    tenantId: tenant._id,
    name: payload.name,
    location: payload.location,
    createdBy: tenant._id,
    updatedBy: null,
  });
  return warehouse;
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAllWarehouseService = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    centralStatus,
    tenantId,
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  // ---- Filter build ----
  const filter = {};

  if (status) filter.status = status;
  if (centralStatus) filter.centralStatus = centralStatus;
  if (tenantId) filter.tenantId = tenantId;
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
    Warehouse.find(filter)
      .populate({ path: "tenantId", select: "-_id -__v" })
      .populate({ path: "createdBy", select: "fullName -_id" })
      .populate({ path: "updatedBy", select: "fullName -_id " })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select("-__v")
      .lean(),
    Warehouse.countDocuments(filter),
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

export const getWarehouseByIDService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid Warehouse ID");
    error.statusCode = 400;
    throw error;
  }

  const doc = await Warehouse.findById(id)
    .populate({ path: "tenantId", select: "-_id -__v" })
    .populate({ path: "createdBy", select: "fullName -_id " })
    .populate({ path: "updatedBy", select: "fullName -_id " })
    .select("-__v")
    .lean();
  return doc;
};

export const updateWarehouseService = async (id, payload) => {
  const doc = await Warehouse.findByIdAndUpdate(id, payload, {
    returnDocument: "after",
    runValidators: true,
  });
  return doc;
};
