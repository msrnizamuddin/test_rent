import tripService from "../service/trip.service.js";

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

// ---------------- 16. Customer: My Trips ----------------
export const getMyTrips = handle(async (req) => {
  const data = await tripService.getMyTrips(req.user.id, req.query);
  return { message: "Trips fetched successfully", data };
});

// ---------------- 15. Driver: Assigned Trips ----------------
export const getAssignedTrips = handle(async (req) => {
  const data = await tripService.getAssignedTrips(req.user.id, req.query);
  return { message: "Assigned trips fetched successfully", data };
});

export const getTripById = handle(async (req) => {
  const data = await tripService.getTripById(req.params.tripId, req.user);
  return { message: "Trip fetched successfully", data };
});

// ---------------- 14. Admin: List All Trips ----------------
export const listTrips = handle(async (req) => {
  const data = await tripService.listTrips(req.query);
  return { message: "Trips fetched successfully", data };
});

// ---------------- 15. Driver: Status Transitions ----------------
export const driverAction = handle(async (req) => {
  const data = await tripService.driverAction(req.params.tripId, req.user.id, req.body);
  return { message: "Trip updated successfully", data };
});

// ---------------- 16.6 Driver: Live Location ----------------
export const updateLocation = handle(async (req) => {
  const data = await tripService.updateLocation(req.params.tripId, req.user.id, req.body);
  return { message: "Location updated successfully", data };
});

// ---------------- Admin: Cancel ----------------
export const cancelTrip = handle(async (req) => {
  const data = await tripService.cancelTrip(req.params.tripId, req.body);
  return { message: "Trip cancelled successfully", data };
});
