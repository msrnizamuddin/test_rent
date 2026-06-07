import Warehouse from "../model/warehouse.model.js";

export const createWarehouseService = async (payload) => {
  const warehouse = await Warehouse.create(
    {
        tenantId: payload.tenantId,
        name: payload.name,
        location: payload.location,
        centralStatus: payload.centralStatus,
        status: payload.status,
    },
  );

  return warehouse;
};

export const getAllWarehouseService = async () => {
  return Warehouse.find();
};

export const updateWarehouseService = async (id, payload) => {
  const warehouse = await Warehouse.findByIdAndUpdate(
    id,
    { ...payload },
    { new: true, runValidators: true },
  );

  if (!warehouse) {
    const err = new Error('Warehouse not found');
    err.status = 404;
    throw err;
  }

  return warehouse;
};