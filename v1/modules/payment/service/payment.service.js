import Payment from "../model/payment.model.js";
import { query } from "../../../../config/db.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// Trips table belongs to another module — read directly, no cross-module import.
const findTripById = async (tripId) => {
  const { rows } = await query(
    `SELECT id, customer_id, driver_id, final_rent, payment_status FROM trips WHERE id = $1`,
    [tripId],
  );
  return rows[0] || null;
};

const syncTripPaymentStatus = async (tripId) => {
  const trip = await findTripById(tripId);
  if (!trip) return;

  const paidTotal = await Payment.sumPaidByTripId(tripId);
  const finalRent = Number(trip.final_rent || 0);

  let paymentStatus = "partial";
  if (finalRent > 0 && paidTotal >= finalRent) {
    paymentStatus = "paid";
  } else if (paidTotal <= 0) {
    paymentStatus = "pending";
  }

  await query(`UPDATE trips SET payment_status = $2, updated_at = now() WHERE id = $1`, [
    tripId,
    paymentStatus,
  ]);
};

// ---------------- POST / — record a payment ----------------
const recordPayment = async (payload, currentUser) => {
  const trip = await findTripById(payload.tripId);
  if (!trip) throw buildError("Trip not found", 404);

  const isStaff = currentUser.role === "superadmin" || currentUser.role === "manager";

  if (currentUser.role === "customer" && trip.customer_id !== currentUser.id) {
    throw buildError("You can only pay for your own trip", 403);
  }

  const customerId = isStaff ? trip.customer_id : currentUser.id;

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
  const isTripDriver = currentUser.role === "driver" && trip.driver_id === currentUser.id;
  const isTripCustomer = currentUser.role === "customer" && trip.customer_id === currentUser.id;

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

export default {
  recordPayment,
  updatePaymentStatus,
  getMyPayments,
  getPaymentsByTrip,
  listPayments,
  refundPayment,
};
