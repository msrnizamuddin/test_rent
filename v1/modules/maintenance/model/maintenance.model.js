import { prisma } from "../../../../config/db.js";

const SELECT = {
  id: true,
  vehicleId: true,
  maintenanceType: true,
  serviceDate: true,
  nextServiceDate: true,
  cost: true,
  notes: true,
  documents: true,
  status: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
};

const getAll = async () =>
  prisma.vehicleMaintenance.findMany({
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });

const search = async ({ vehicleId, status }) => {
  const where = {};
  if (vehicleId) where.vehicleId = vehicleId;
  if (status) where.status = status;

  return prisma.vehicleMaintenance.findMany({
    where,
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });
};

const findById = async (id) =>
  prisma.vehicleMaintenance.findUnique({ where: { id }, select: SELECT });

const create = async (payload, createdById) =>
  prisma.vehicleMaintenance.create({
    data: {
      vehicleId: payload.vehicleId,
      maintenanceType: payload.maintenanceType,
      serviceDate: payload.serviceDate,
      nextServiceDate: payload.nextServiceDate || null,
      cost: payload.cost ?? null,
      notes: payload.notes || null,
      documents: payload.documents || [],
      status: payload.status || "scheduled",
      createdById: createdById || null,
    },
    select: SELECT,
  });

const FIELD_MAP = {
  maintenanceType: "maintenanceType",
  serviceDate: "serviceDate",
  nextServiceDate: "nextServiceDate",
  cost: "cost",
  notes: "notes",
  documents: "documents",
  status: "status",
};

const updateById = async (id, payload) => {
  const data = {};
  for (const [key, value] of Object.entries(payload)) {
    if (FIELD_MAP[key] === undefined) continue;
    data[FIELD_MAP[key]] = value;
  }
  if (!Object.keys(data).length) return findById(id);

  try {
    return await prisma.vehicleMaintenance.update({ where: { id }, data, select: SELECT });
  } catch (error) {
    if (error.code === "P2025") return null;
    throw error;
  }
};

const deleteById = async (id) => {
  try {
    return await prisma.vehicleMaintenance.delete({ where: { id }, select: { id: true } });
  } catch (error) {
    if (error.code === "P2025") return null;
    throw error;
  }
};

export default { getAll, search, findById, create, updateById, deleteById };
