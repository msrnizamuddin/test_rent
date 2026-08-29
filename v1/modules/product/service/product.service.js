import mongoose from "mongoose";
import Product from "../model/product.model.js";
import Inventory from "../../inventory/model/inventory.model.js";
export const createProductWithInventoryService = async (
  productData,
  inventoryArray,
  tenantId,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const newProduct = new Product({
      ...productData,
      tenantId,
    });
    const savedProduct = await newProduct.save({ session });

    const inventoryDocs = inventoryArray.map((inv) => ({
      ...inv,
      productId: savedProduct._id,
      tenantId,
    }));
    console.log("Inventory docs:", inventoryDocs);
    await Inventory.insertMany(inventoryDocs, { session });
    console.log("Inventory inserted");
    await session.commitTransaction();
    session.endSession();

    return savedProduct;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getAllProductsService = async (query = {}) => {
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

  if (status) filter.status = status;
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
              { $eq: [{ $type: "$productName" }, "object"] },
              { $objectToArray: "$productName" },
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
    Product.find(filter)
      .populate({ path: "tenantId", select: " -_id -__v" })
      .populate({ path: "productCategory", select: " name -_id" })
      .populate({ path: "productSubCategory", select: " name -_id" })
      .populate({ path: "productChildCategory", select: "name -_id" })
      .populate({ path: "productBrand", select: " name -_id" })
      .populate({ path: "inventoryItems", select: " -__v" })
      // .populate({ path: "createdBy", select: "-password -__v" })
      // .populate({ path: "updatedBy", select: "-password -__v" })
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select("-__v")
      .lean(),
    Product.countDocuments(filter),
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

export const getProductByIdService = async (id) => {
  const product = await Product.findById(id).populate([
    {
      path: "tenantId",
      select: "-_id -__v",
    },
    {
      path: "productCategory",
    },
    {
      path: "productChildCategory",
    },
    {
      path: "productSubCategory",
    },
    {
      path: "productBrand",
    },
    {
      path: "inventoryItems",
      populate: [
        {
          path: "warehouseId",
        },
        {
          path: "sizeId",
        },
      ],
    },
  ]);

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};
const localizedFields = [
  "productName",
  "productDescription",
  "productShortDescription",
  "productHowToCare",
  "deliveryInstructions",
  "metaTitle",
  "metaDescription",
];
export const updateProductService = async (id, payload) => {
  const updateData = {};

  for (const [key, value] of Object.entries(payload)) {
    if (
      localizedFields.includes(key) &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      for (const [lang, text] of Object.entries(value)) {
        updateData[`${key}.${lang}`] = text;
      }
    } else {
      updateData[key] = value;
    }
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};
