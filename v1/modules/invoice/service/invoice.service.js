import Invoice from "../model/invoice.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// Trips/payments belong to other modules — the model reads them directly via
// Prisma, no cross-module import.
const findTripById = Invoice.findTripById;
const sumPaidPaymentsForTrip = Invoice.sumPaidPaymentsForTrip;

const generateInvoiceNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INV-${year}${month}-${suffix}`;
};

const resolvePaymentStatus = (dueAmount, total) => {
  if (dueAmount <= 0 && total > 0) return "paid";
  if (dueAmount > 0 && dueAmount < total) return "partial";
  return "pending";
};

// ---------------- POST /generate ----------------
const generateInvoice = async (payload) => {
  const trip = await findTripById(payload.tripId);
  if (!trip) throw buildError("Trip not found", 404);

  const existing = await Invoice.findByTripId(payload.tripId);
  if (existing) throw buildError("An invoice already exists for this trip", 409);

  const rentalCharge = payload.rentalCharge || 0;
  const driverCharge = payload.driverCharge || 0;
  const additionalCharges = payload.additionalCharges || 0;
  const tax = payload.tax || 0;
  const discount = payload.discount || 0;

  const total = rentalCharge + driverCharge + additionalCharges + tax - discount;
  const paidAmount = await sumPaidPaymentsForTrip(payload.tripId);
  const dueAmount = total - paidAmount;
  const paymentStatus = resolvePaymentStatus(dueAmount, total);

  let invoiceNumber = generateInvoiceNumber();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const clash = await Invoice.findByInvoiceNumber(invoiceNumber);
    if (!clash) break;
    invoiceNumber = generateInvoiceNumber();
  }

  try {
    return await Invoice.create({
      tripId: payload.tripId,
      invoiceNumber,
      rentalCharge,
      driverCharge,
      additionalCharges,
      tax,
      discount,
      total,
      paidAmount,
      dueAmount,
      paymentStatus,
    });
  } catch (error) {
    if (error.code === "P2002") {
      // unique_violation — retry once with a fresh number
      invoiceNumber = generateInvoiceNumber();
      return Invoice.create({
        tripId: payload.tripId,
        invoiceNumber,
        rentalCharge,
        driverCharge,
        additionalCharges,
        tax,
        discount,
        total,
        paidAmount,
        dueAmount,
        paymentStatus,
      });
    }
    throw error;
  }
};

const assertTripAccess = async (tripId, currentUser) => {
  if (currentUser.role === "superadmin" || currentUser.role === "manager") return;

  const trip = await findTripById(tripId);
  if (!trip) throw buildError("Trip not found", 404);
  if (currentUser.role === "customer" && trip.customerId === currentUser.id) return;

  throw buildError("Access denied", 403);
};

// ---------------- GET /trip/:tripId ----------------
const getInvoiceByTripId = async (tripId, currentUser) => {
  await assertTripAccess(tripId, currentUser);

  const invoice = await Invoice.findByTripId(tripId);
  if (!invoice) throw buildError("Invoice not found", 404);
  return invoice;
};

// ---------------- GET /:invoiceId ----------------
const getInvoiceById = async (invoiceId, currentUser) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw buildError("Invoice not found", 404);

  await assertTripAccess(invoice.tripId, currentUser);
  return invoice;
};

// ---------------- GET / — list all (staff) ----------------
const listInvoices = async (queryParams) => {
  const { invoices, total } = await Invoice.search(queryParams);
  const { page, limit } = queryParams;

  return {
    invoices,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ---------------- GET /mine ----------------
const getMyInvoices = async (customerId) => {
  return Invoice.findByCustomerId(customerId);
};

// Safe "get everything" — no filters, no conditions.
const getAll = async () => Invoice.getAll();

export default {
  generateInvoice,
  getInvoiceByTripId,
  getInvoiceById,
  listInvoices,
  getMyInvoices,
  getAll,
};
