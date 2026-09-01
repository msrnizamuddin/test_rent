import { prisma } from "../../../../config/db.js";

// Prisma's generated field names already match our camelCase API shape (see
// prisma/schema.prisma — every column is @map()'d from snake_case), so
// payment rows need no reshaping before being returned to callers.
const mapPayment = (row) => row;

const SELECT = {
  id: true,
  tripId: true,
  customerId: true,
  amount: true,
  paymentType: true,
  method: true,
  status: true,
  transactionId: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
};

const create = async (payload) => {
  const payment = await prisma.payment.create({
    data: {
      tripId: payload.tripId,
      customerId: payload.customerId,
      amount: payload.amount,
      paymentType: payload.paymentType,
      method: payload.method,
      status: payload.status || "pending",
      transactionId: payload.transactionId || null,
      paidAt: payload.status === "paid" ? new Date() : null,
    },
    select: SELECT,
  });
  return mapPayment(payment);
};

const findById = async (id) => {
  const payment = await prisma.payment.findUnique({ where: { id }, select: SELECT });
  return mapPayment(payment);
};

const findByTripId = async (tripId) => {
  const payments = await prisma.payment.findMany({
    where: { tripId },
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });
  return payments.map(mapPayment);
};

const findByCustomerId = async (customerId) => {
  const payments = await prisma.payment.findMany({
    where: { customerId },
    select: SELECT,
    orderBy: { createdAt: "desc" },
  });
  return payments.map(mapPayment);
};

const search = async ({ status, method, customerId, page, limit }) => {
  const where = {};
  if (status) where.status = status;
  if (method) where.method = method;
  if (customerId) where.customerId = customerId;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      select: SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return { payments: payments.map(mapPayment), total };
};

const updateStatus = async (id, { status, transactionId }) => {
  const data = { status };
  if (transactionId !== undefined) data.transactionId = transactionId;
  if (status === "paid") data.paidAt = new Date();

  try {
    const payment = await prisma.payment.update({ where: { id }, data, select: SELECT });
    return mapPayment(payment);
  } catch (error) {
    if (error.code === "P2025") return null; // record not found
    throw error;
  }
};

// Sum of all `paid` payments for a trip. Payment.amount is a Prisma Decimal —
// aggregate's _sum comes back as a Decimal (or null when there are no rows),
// so it must go through .toNumber() rather than a naive numeric comparison.
const sumPaidByTripId = async (tripId) => {
  const agg = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { tripId, status: "paid" },
  });
  return agg._sum.amount ? agg._sum.amount.toNumber() : 0;
};

// Trips table belongs to another module — read/write it directly via Prisma
// rather than importing the trip module (same approach the raw-SQL version used).
const findTripById = async (tripId) =>
  prisma.trip.findUnique({
    where: { id: tripId },
    select: { id: true, customerId: true, driverId: true, finalRent: true, paymentStatus: true },
  });

const syncTripPaymentStatus = async (tripId) => {
  const trip = await findTripById(tripId);
  if (!trip) return;

  const paidTotal = await sumPaidByTripId(tripId);
  // finalRent is also a Decimal — convert before comparing against the
  // (already-numeric) paidTotal so this never falls back to Decimal object
  // identity/string comparison.
  const finalRent = trip.finalRent ? trip.finalRent.toNumber() : 0;

  let paymentStatus = "partial";
  if (finalRent > 0 && paidTotal >= finalRent) {
    paymentStatus = "paid";
  } else if (paidTotal <= 0) {
    paymentStatus = "pending";
  }

  await prisma.trip.update({ where: { id: tripId }, data: { paymentStatus } });
};

export default {
  create,
  findById,
  findByTripId,
  findByCustomerId,
  search,
  updateStatus,
  sumPaidByTripId,
  findTripById,
  syncTripPaymentStatus,
};
