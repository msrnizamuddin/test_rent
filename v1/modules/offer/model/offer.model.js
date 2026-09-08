import { prisma } from "../../../../config/db.js";

const mapOffer = (row) => {
  if (!row) return null;
  return { ...row };
};

const SELECT = {
  id: true,
  title: true,
  subtitle: true,
  tripType: true,
  status: true,
  fromLocation: true,
  toLocation: true,
  discountType: true,
  discountValue: true,
  startDate: true,
  endDate: true,
  bannerImage: true,
  offerText: true,
  createdAt: true,
  updatedAt: true,
};

const search = async ({ status, tripType }) => {
  const where = {};
  if (status) where.status = status;
  if (tripType) where.tripType = tripType;

  const offers = await prisma.offer.findMany({
    where,
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });

  return offers.map(mapOffer);
};

// Safe "get everything" — no where clause at all.
const getAll = async () => {
  const offers = await prisma.offer.findMany({
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });
  return offers.map(mapOffer);
};

const findById = async (id) => {
  const offer = await prisma.offer.findUnique({ where: { id }, select: SELECT });
  return mapOffer(offer);
};

const create = async (payload) => {
  const offer = await prisma.offer.create({
    data: {
      title: payload.title,
      subtitle: payload.subtitle || null,
      tripType: payload.tripType || null,
      status: payload.status || "active",
      fromLocation: payload.fromLocation || null,
      toLocation: payload.toLocation || null,
      discountType: payload.discountType || "percentage",
      discountValue: payload.discountValue,
      startDate: payload.startDate || null,
      endDate: payload.endDate || null,
      bannerImage: payload.bannerImage || null,
      offerText: payload.offerText || null,
    },
    select: SELECT,
  });

  return mapOffer(offer);
};

const FIELD_MAP = {
  title: "title",
  subtitle: "subtitle",
  tripType: "tripType",
  status: "status",
  fromLocation: "fromLocation",
  toLocation: "toLocation",
  discountType: "discountType",
  discountValue: "discountValue",
  startDate: "startDate",
  endDate: "endDate",
  bannerImage: "bannerImage",
  offerText: "offerText",
};

const updateById = async (id, payload) => {
  const data = {};
  for (const [key, value] of Object.entries(payload)) {
    if (FIELD_MAP[key] === undefined) continue;
    data[FIELD_MAP[key]] = value;
  }
  if (!Object.keys(data).length) return findById(id);

  try {
    const offer = await prisma.offer.update({ where: { id }, data, select: SELECT });
    return mapOffer(offer);
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

const deleteById = async (id) => {
  try {
    return await prisma.offer.delete({ where: { id }, select: { id: true } });
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

export default {
  search,
  getAll,
  findById,
  create,
  updateById,
  deleteById,
};
