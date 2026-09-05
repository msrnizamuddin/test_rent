import Maintenance from "../model/maintenance.model.js";
import { prisma } from "../../../../config/db.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const getAll = async () => Maintenance.getAll();

const search = async (query) => Maintenance.search(query);

const getById = async (id) => {
  const record = await Maintenance.findById(id);
  if (!record) throw buildError("Maintenance record not found", 404);
  return record;
};

// Vehicle should not appear as available while under maintenance (spec
// module 24) — flip its status alongside creating the record.
const create = async (payload, createdById) => {
  const record = await Maintenance.create(payload, createdById);
  await prisma.vehicle.update({
    where: { id: payload.vehicleId },
    data: { availabilityStatus: "maintenance" },
  }).catch(() => {});
  return record;
};

const update = async (id, payload) => {
  const record = await Maintenance.updateById(id, payload);
  if (!record) throw buildError("Maintenance record not found", 404);

  if (payload.status === "completed" || payload.status === "cancelled") {
    await prisma.vehicle.update({
      where: { id: record.vehicleId },
      data: { availabilityStatus: "available" },
    }).catch(() => {});
  }

  return record;
};

const remove = async (id) => {
  const deleted = await Maintenance.deleteById(id);
  if (!deleted) throw buildError("Maintenance record not found", 404);
  return { deleted: true };
};

export default { getAll, search, getById, create, update, remove };
