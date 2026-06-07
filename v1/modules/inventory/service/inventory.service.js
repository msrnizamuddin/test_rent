import Inventory from "../model/inventory.model.js";

export const createInventoryService = async (payload) => {
  const inventory = await Inventory.create(payload);

  return inventory;
};

export const getAllInventoryService = async (
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const [inventories, total] = await Promise.all([
    Inventory.find()
      .populate("warehouseId")
      .populate("sizeId")
      .populate("createdBy")
      .populate("updatedBy")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),

    Inventory.countDocuments(),
  ]);

  return {
    inventories,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getInventoryByIdService = async (id) => {
  const inventory = await Inventory.findById(id)
    .populate("warehouseId")
    .populate("sizeId")
    .populate("createdBy")
    .populate("updatedBy");

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  return inventory;
};

export const updateInventoryService = async (
  id,
  payload
) => {
  const inventory = await Inventory.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("warehouseId")
    .populate("sizeId")
    .populate("createdBy")
    .populate("updatedBy");

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  return inventory;
};

export const deleteInventoryService = async (id) => {
  const inventory = await Inventory.findByIdAndDelete(id);

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  return inventory;
};