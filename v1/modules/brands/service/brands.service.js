import Brands from "../model/brands.model.js";

const createBrands = async (brandsData, tenant) => {
  // Brand create
  const brand = await Brands.create({
    tenantId: tenant._id,
    name: brandsData.name,
    slug: brandsData.slug,
    profileImage: brandsData.profileImage || "",
    createdBy: tenant._id,
  });

  return brand;
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getBrands = async (query = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    tenantId,
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  // ---- Filter build ----
  const filter = {};

// if (search) {
//   const safeSearch = escapeRegex(search);
//   filter.$or = [
//     { "name.en": { $regex: "^" + safeSearch, $options: "i" } },
//     { "name.ar": { $regex: "^" + safeSearch, $options: "i" } },
//     { "name.bn": { $regex: "^" + safeSearch, $options: "i" } },
//   ];
// }

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
  if (status) filter.status = status;
  if (tenantId) filter.tenantId = tenantId;

  if (isActive !== undefined) {
    filter.status = isActive === "true" ? "active" : "inactive";
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
    Brands.find(filter)
      .populate({ path: "tenantId", select: " -_id -__v" })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select("-__v")
      .lean(),
    Brands.countDocuments(filter),
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

const getBrandsById = async (id) => {
  return await Brands.findById(id).populate({ path: "tenantId", select: "_id -__v" });
};

const updateBrands = async (id, updateData) => {
  return await Brands.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

export const brandsService = {
  createBrands,
  getBrands,
  getBrandsById,
  updateBrands,
};
