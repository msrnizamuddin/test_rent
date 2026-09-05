import paymentService from "../service/payment.service.js";

const handle = (fn) => async (req, res, next) => {
  try {
    const result = await fn(req, res);
    res.status(result.statusCode || 200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const recordPayment = handle(async (req) => {
  const data = await paymentService.recordPayment(req.body, req.user);
  return { statusCode: 201, message: "Payment recorded successfully", data };
});

export const updatePaymentStatus = handle(async (req) => {
  const data = await paymentService.updatePaymentStatus(req.params.paymentId, req.body);
  return { message: "Payment status updated successfully", data };
});

export const getMyPayments = handle(async (req) => {
  const data = await paymentService.getMyPayments(req.user.id);
  return { message: "Payment history fetched successfully", data };
});

export const getPaymentsByTrip = handle(async (req) => {
  const data = await paymentService.getPaymentsByTrip(req.params.tripId, req.user);
  return { message: "Trip payments fetched successfully", data };
});

export const listPayments = handle(async (req) => {
  const data = await paymentService.listPayments(req.query);
  return { message: "Payments fetched successfully", data };
});

// Safe "get everything" — no filters, no conditions.
export const getAll = handle(async () => {
  const data = await paymentService.getAll();
  return { message: "All payments fetched successfully", data };
});

export const refundPayment = handle(async (req) => {
  const data = await paymentService.refundPayment(req.params.paymentId, req.body.reason);
  return { message: "Payment refunded successfully", data };
});
