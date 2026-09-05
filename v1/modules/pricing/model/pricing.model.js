import { prisma } from "../../../../config/db.js";

const SELECT = {
  id: true,
  name: true,
  tripType: true,
  categoryId: true,
  vehicleId: true,
  perKmRate: true,
  perHourRate: true,
  perDayRate: true,
  driverCharge: true,
  waitingCharge: true,
  extraKmCharge: true,
  nightCharge: true,
  serviceCharge: true,
  taxPercent: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

const getAll = async () =>
  prisma.pricingRule.findMany({ select: SELECT, orderBy: { createdAt: "desc" } });

const search = async ({ tripType, categoryId, vehicleId, isActive }) => {
  const where = {};
  if (tripType) where.tripType = tripType;
  if (categoryId) where.categoryId = categoryId;
  if (vehicleId) where.vehicleId = vehicleId;
  if (isActive !== undefined) where.isActive = isActive;

  return prisma.pricingRule.findMany({
    where,
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });
};

const findById = async (id) =>
  prisma.pricingRule.findUnique({ where: { id }, select: SELECT });

const create = async (payload) =>
  prisma.pricingRule.create({
    data: {
      name: payload.name,
      tripType: payload.tripType || null,
      categoryId: payload.categoryId || null,
      vehicleId: payload.vehicleId || null,
      perKmRate: payload.perKmRate ?? null,
      perHourRate: payload.perHourRate ?? null,
      perDayRate: payload.perDayRate ?? null,
      driverCharge: payload.driverCharge ?? null,
      waitingCharge: payload.waitingCharge ?? null,
      extraKmCharge: payload.extraKmCharge ?? null,
      nightCharge: payload.nightCharge ?? null,
      serviceCharge: payload.serviceCharge ?? null,
      taxPercent: payload.taxPercent ?? null,
      isActive: payload.isActive ?? true,
    },
    select: SELECT,
  });

const FIELD_MAP = {
  name: "name",
  tripType: "tripType",
  categoryId: "categoryId",
  vehicleId: "vehicleId",
  perKmRate: "perKmRate",
  perHourRate: "perHourRate",
  perDayRate: "perDayRate",
  driverCharge: "driverCharge",
  waitingCharge: "waitingCharge",
  extraKmCharge: "extraKmCharge",
  nightCharge: "nightCharge",
  serviceCharge: "serviceCharge",
  taxPercent: "taxPercent",
  isActive: "isActive",
};

const updateById = async (id, payload) => {
  const data = {};
  for (const [key, value] of Object.entries(payload)) {
    if (FIELD_MAP[key] === undefined) continue;
    data[FIELD_MAP[key]] = value;
  }
  if (!Object.keys(data).length) return findById(id);

  try {
    return await prisma.pricingRule.update({ where: { id }, data, select: SELECT });
  } catch (error) {
    if (error.code === "P2025") return null;
    throw error;
  }
};

const deleteById = async (id) => {
  try {
    return await prisma.pricingRule.delete({ where: { id }, select: { id: true } });
  } catch (error) {
    if (error.code === "P2025") return null;
    throw error;
  }
};

export default { getAll, search, findById, create, updateById, deleteById };
