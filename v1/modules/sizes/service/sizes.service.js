import mongoose from "mongoose";
import tenantGetId from "../../../utils/tenentHalper.js";
import Sizes from "../model/sizes.model.js";

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createSizesService = async (payload) => {
  const tenant = await tenantGetId(payload.tenantId);

  if (!tenant) {
    const err = new Error("Tenant not found");
    err.statusCode = 404;
    throw err;
  }

  const sizes = await Sizes.create({
    tenantId: tenant._id,
    name: payload.name,
    centralStatus: payload.centralStatus,
    status: payload.status,
    createdBy: tenant._id,
    updatedBy: null,
  });

  return sizes;
};

export const getAllSizesService = async (query = {}) => {
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

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const allowedSortFields = ["createdAt", "updatedAt", "status"];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sort = { [safeSortBy]: sortOrder === "asc" ? 1 : -1 };

  const [data, total] = await Promise.all([
    Sizes.find(filter)
      .populate({ path: "tenantId", select: "-_id -__v" })
      .populate({ path: "createdBy", select: "-_id fullName " })
      .populate({ path: "updatedBy", select: "-_id fullName " })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select("-__v")
      .lean(),
    Sizes.countDocuments(filter),
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

export const getSizesByIDService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid Sizes ID");
    err.statusCode = 400;
    throw err;
  }

  const sizes = await Sizes.findById(id)
    .populate({ path: "tenantId", select: "-_id -__v" })
    .populate({ path: "createdBy", select: "-_id fullName " })
    .populate({ path: "updatedBy", select: "-_id fullName " })
    .select("-__v")
    .lean();

  return sizes;
};

export const updateSizesService = async (id, payload) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid Sizes ID");
    err.statusCode = 400;
    throw err;
  }

  const sizes = await Sizes.findByIdAndUpdate(
    id,
    { ...payload },
    { returnDocument: "after", runValidators: true },
  );

  if (!sizes) {
    const err = new Error("Sizes not found");
    err.statusCode = 404;
    throw err;
  }

  return sizes;
};