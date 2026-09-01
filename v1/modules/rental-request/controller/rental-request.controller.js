import rentalRequestService from "../service/rental-request.service.js";

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

// ---------------- 3. Create Rental Request ----------------
export const createRentalRequest = handle(async (req) => {
  const data = await rentalRequestService.createRentalRequest(req.body, req.user.id);
  return { statusCode: 201, message: "Rental request submitted successfully", data };
});

// ---------------- 10. Customer: My Rental Requests ----------------
export const getMyRentalRequests = handle(async (req) => {
  const data = await rentalRequestService.getMyRentalRequests(req.user.id, req.query);
  return { message: "Rental requests fetched successfully", data };
});

export const getRentalRequestById = handle(async (req) => {
  const data = await rentalRequestService.getRentalRequestById(req.params.requestId, req.user);
  return { message: "Rental request fetched successfully", data };
});

export const cancelRentalRequest = handle(async (req) => {
  const data = await rentalRequestService.cancelRentalRequest(
    req.params.requestId,
    req.user.id,
    req.body,
  );
  return { message: "Rental request cancelled successfully", data };
});

// ---------------- 11. Admin: List / Review ----------------
export const listRentalRequests = handle(async (req) => {
  const data = await rentalRequestService.listRentalRequests(req.query);
  return { message: "Rental requests fetched successfully", data };
});

export const reviewRentalRequest = handle(async (req) => {
  const data = await rentalRequestService.reviewRentalRequest(req.params.requestId, req.body);
  return { message: "Rental request reviewed successfully", data };
});

// ---------------- 12. Admin: Confirm ----------------
export const confirmRentalRequest = handle(async (req) => {
  const data = await rentalRequestService.confirmRentalRequest(
    req.params.requestId,
    req.body,
    req.user.id,
  );
  return { message: "Rental request confirmed successfully", data };
});

// ---------------- 13. Admin: Assign Vehicle / Driver / Reject ----------------
export const assignVehicle = handle(async (req) => {
  const data = await rentalRequestService.assignVehicle(req.params.requestId, req.body);
  return { message: "Vehicle assigned successfully", data };
});

export const assignDriver = handle(async (req) => {
  const data = await rentalRequestService.assignDriver(req.params.requestId, req.body);
  return { message: "Driver assigned successfully", data };
});

export const rejectRentalRequest = handle(async (req) => {
  const data = await rentalRequestService.rejectRentalRequest(req.params.requestId, req.body);
  return { message: "Rental request rejected successfully", data };
});
