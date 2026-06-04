import Warehouse from "../model/warehouse.model.js";

export const createWarehouseService = async (payload) => {
  const warehouse = await Warehouse.create(
    {
        tenantId: payload.tenantId,
        name: payload.name,
        location: payload.location,
        centralStatus: payload.centralStatus,
    },
  );

  return warehouse;
};

export const getAllWarehouseService = async () => {
  return Warehouse.find();
};