import { prisma } from "../../../../config/db.js";

// Prisma's generated field names already match our camelCase API shape (see
// prisma/schema.prisma — every column is @map()'d from snake_case). The only
// reshaping kept from the raw-SQL version is surfacing a `trip` sub-object
// when the row was fetched with the trip relation joined in (GET /mine).
const mapInvoice = (row) => {
  if (!row) return null;
  const { trip, ...rest } = row;
  return {
    ...rest,
    ...(trip !== undefined
      ? {
          trip: trip
            ? {
                id: rest.tripId,
                customerId: trip.customerId,
                pickupDate: trip.pickupDate,
                returnDate: trip.returnDate,
                status: trip.status,
              }
            : undefined,
        }
      : {}),
  };
};

const SELECT = {
  id: true,
  tripId: true,
  invoiceNumber: true,
  rentalCharge: true,
  driverCharge: true,
  additionalCharges: true,
  tax: true,
  discount: true,
  total: true,
  paidAmount: true,
  dueAmount: true,
  paymentStatus: true,
  createdAt: true,
  updatedAt: true,
};

const create = async (payload) => {
  const invoice = await prisma.invoice.create({
    data: {
      tripId: payload.tripId,
      invoiceNumber: payload.invoiceNumber,
      rentalCharge: payload.rentalCharge,
      driverCharge: payload.driverCharge,
      additionalCharges: payload.additionalCharges,
      tax: payload.tax,
      discount: payload.discount,
      total: payload.total,
      paidAmount: payload.paidAmount,
      dueAmount: payload.dueAmount,
      paymentStatus: payload.paymentStatus,
    },
    select: SELECT,
  });
  return mapInvoice(invoice);
};

const findByInvoiceNumber = async (invoiceNumber) =>
  prisma.invoice.findUnique({ where: { invoiceNumber }, select: { id: true } });

const findByTripId = async (tripId) => {
  const invoice = await prisma.invoice.findUnique({ where: { tripId }, select: SELECT });
  return mapInvoice(invoice);
};

const findById = async (id) => {
  const invoice = await prisma.invoice.findUnique({ where: { id }, select: SELECT });
  return mapInvoice(invoice);
};

const findByCustomerId = async (customerId) => {
  const invoices = await prisma.invoice.findMany({
    where: { trip: { customerId } },
    select: {
      ...SELECT,
      trip: { select: { customerId: true, pickupDate: true, returnDate: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return invoices.map(mapInvoice);
};

const search = async ({ paymentStatus, page, limit }) => {
  const where = {};
  if (paymentStatus) where.paymentStatus = paymentStatus;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      select: SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ]);

  return { invoices: invoices.map(mapInvoice), total };
};

// Trips table belongs to another module — read it directly via Prisma rather
// than importing the trip module (same approach the raw-SQL version used).
const findTripById = async (tripId) =>
  prisma.trip.findUnique({
    where: { id: tripId },
    select: { id: true, customerId: true, status: true },
  });

// Sum of all `paid` payments for a trip. Payment.amount is a Prisma Decimal —
// aggregate's _sum comes back as a Decimal (or null when there are no rows),
// so it must go through .toNumber() rather than a naive numeric comparison.
const sumPaidPaymentsForTrip = async (tripId) => {
  const agg = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { tripId, status: "paid" },
  });
  return agg._sum.amount ? agg._sum.amount.toNumber() : 0;
};

export default {
  create,
  findByInvoiceNumber,
  findByTripId,
  findById,
  findByCustomerId,
  search,
  findTripById,
  sumPaidPaymentsForTrip,
};
