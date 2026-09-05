import Payment from "../model/payment.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// Trips table belongs to another module — the model reads/writes it directly
// via Prisma, no cross-module import.
const findTripById = Payment.findTripById;
const syncTripPaymentStatus = Payment.syncTripPaymentStatus;

// ---------------- POST / — record a payment ----------------
const recordPayment = async (payload, currentUser) => {
  const trip = await findTripById(payload.tripId);
  if (!trip) throw buildError("Trip not found", 404);

  const isStaff = currentUser.role === "superadmin" || currentUser.role === "manager";

  if (currentUser.role === "customer" && trip.customerId !== currentUser.id) {
    throw buildError("You can only pay for your own trip", 403);
  }

  const customerId = isStaff ? trip.customerId : currentUser.id;

  let status = "pending";
  if (payload.status === "paid") {
    if (!isStaff) {
      throw buildError("Only superadmin/manager can record a payment as already paid", 403);
    }
    status = "paid";
  }

  const payment = await Payment.create({
    tripId: payload.tripId,
    customerId,
    amount: payload.amount,
    paymentType: payload.paymentType,
    method: payload.method,
    transactionId: payload.transactionId,
    status,
  });

  if (payment.status === "paid") {
    await syncTripPaymentStatus(payment.tripId);
  }

  return payment;
};

// ---------------- PATCH /:paymentId/status ----------------
const updatePaymentStatus = async (paymentId, { status, transactionId }) => {
  const existing = await Payment.findById(paymentId);
  if (!existing) throw buildError("Payment not found", 404);

  const payment = await Payment.updateStatus(paymentId, { status, transactionId });

  if (status === "paid") {
    await syncTripPaymentStatus(payment.tripId);
  }

  return payment;
};

// ---------------- GET /mine ----------------
const getMyPayments = async (customerId) => {
  return Payment.findByCustomerId(customerId);
};

// ---------------- GET /trip/:tripId ----------------
const getPaymentsByTrip = async (tripId, currentUser) => {
  const trip = await findTripById(tripId);
  if (!trip) throw buildError("Trip not found", 404);

  const isStaff = currentUser.role === "superadmin" || currentUser.role === "manager";
  const isTripDriver = currentUser.role === "driver" && trip.driverId === currentUser.id;
  const isTripCustomer = currentUser.role === "customer" && trip.customerId === currentUser.id;

  if (!isStaff && !isTripDriver && !isTripCustomer) {
    throw buildError("Access denied", 403);
  }

  return Payment.findByTripId(tripId);
};

// ---------------- GET / — list all (staff) ----------------
const listPayments = async (queryParams) => {
  const { payments, total } = await Payment.search(queryParams);
  const { page, limit } = queryParams;

  return {
    payments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ---------------- POST /:paymentId/refund ----------------
const refundPayment = async (paymentId, reason) => {
  const existing = await Payment.findById(paymentId);
  if (!existing) throw buildError("Payment not found", 404);

  const payment = await Payment.updateStatus(paymentId, { status: "refunded" });
  await syncTripPaymentStatus(payment.tripId);

  return { ...payment, refundReason: reason || null };
};

// Safe "get everything" — no filters, no conditions.
const getAll = async () => Payment.getAll();

export default {
  recordPayment,
  updatePaymentStatus,
  getMyPayments,
  getPaymentsByTrip,
  listPayments,
  refundPayment,
  getAll,
};
