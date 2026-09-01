import RentalRequest, { CANCELLABLE_STATUSES } from "../model/rental-request.model.js";
import Vehicle from "../../vehicle/model/vehicle.model.js";
import User from "../../auth/model/auth.model.js";
import Trip from "../../trip/model/trip.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// ---------------------------------------------------------------------------
// Placeholder pricing model (module 4 — Estimated Rent Calculation)
//
// There is no dedicated Pricing module yet, so this is a deliberately simple,
// clearly-flagged estimate: a flat base rate + a per-km placeholder (sourced
// from the vehicle's own estimatedRentalRate when one was picked) + a flat
// driver charge + a flat service charge + a flat tax percentage. Replace this
// with real pricing logic once a Pricing module exists.
// ---------------------------------------------------------------------------
const PLACEHOLDER_BASE_RATE = 1500; // flat base fare, in local currency units
const PLACEHOLDER_PER_KM_RATE = 20; // used only when the vehicle has no rate set
const PLACEHOLDER_ESTIMATED_KM = 50; // flat placeholder distance until a maps/distance API is wired up
const PLACEHOLDER_DRIVER_CHARGE = 800;
const PLACEHOLDER_SERVICE_CHARGE = 200;
const PLACEHOLDER_TAX_RATE = 0.05; // 5%

const calculateEstimatedRent = ({ vehicle, tripType, driverRequired }) => {
  const perKmRate = vehicle?.estimatedRentalRate?.perKm || PLACEHOLDER_PER_KM_RATE;
  const distanceKm = tripType === "round" ? PLACEHOLDER_ESTIMATED_KM * 2 : PLACEHOLDER_ESTIMATED_KM;

  const baseFare = PLACEHOLDER_BASE_RATE;
  const distanceFare = perKmRate * distanceKm;
  const driverCharge = driverRequired ? PLACEHOLDER_DRIVER_CHARGE : 0;
  const serviceCharge = PLACEHOLDER_SERVICE_CHARGE;
  const subtotal = baseFare + distanceFare + driverCharge + serviceCharge;
  const tax = Math.round(subtotal * PLACEHOLDER_TAX_RATE);
  const total = subtotal + tax;

  return {
    baseFare,
    perKmRate,
    estimatedDistanceKm: distanceKm,
    distanceFare,
    driverCharge,
    serviceCharge,
    tax,
    total,
    note: "Placeholder pricing model — no dedicated Pricing module yet.",
  };
};

// ---------------- 3. Create Rental Request ----------------
const createRentalRequest = async (payload, customerId) => {
  if (payload.tripType === "round" && (!payload.returnLocation || !payload.returnDate)) {
    throw buildError("Round trips require returnLocation and returnDate", 400);
  }

  let vehicle = null;
  if (payload.vehicleId) {
    vehicle = await Vehicle.findById(payload.vehicleId);
    if (!vehicle) throw buildError("Selected vehicle not found", 404);
  }

  const estimatedRent = calculateEstimatedRent({
    vehicle,
    tripType: payload.tripType,
    driverRequired: payload.driverRequired,
  });

  const rentalRequest = await RentalRequest.create(
    {
      ...payload,
      estimatedDistanceKm: estimatedRent.estimatedDistanceKm,
      estimatedRent,
      status: "submitted",
    },
    customerId,
  );

  return rentalRequest;
};

// ---------------- 10. Customer: My Rental Requests ----------------
const getMyRentalRequests = async (customerId, { status, page, limit }) => {
  const { rentalRequests, total } = await RentalRequest.findMineByCustomer({
    customerId,
    status,
    page,
    limit,
  });

  return {
    rentalRequests,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getRentalRequestById = async (requestId, user) => {
  const rentalRequest = await RentalRequest.findById(requestId);
  if (!rentalRequest) throw buildError("Rental request not found", 404);

  if (user.role === "customer" && rentalRequest.customerId !== user.id) {
    throw buildError("Rental request not found", 404);
  }

  return rentalRequest;
};

// ---------------- 10. Customer: Cancel ----------------
const cancelRentalRequest = async (requestId, customerId, { cancellationReason }) => {
  const rentalRequest = await RentalRequest.findById(requestId);
  if (!rentalRequest) throw buildError("Rental request not found", 404);
  if (rentalRequest.customerId !== customerId) throw buildError("Rental request not found", 404);

  if (!CANCELLABLE_STATUSES.includes(rentalRequest.status)) {
    throw buildError(`Cannot cancel a request in status '${rentalRequest.status}'`, 400);
  }

  return RentalRequest.updateById(requestId, {
    status: "cancelled",
    cancellationReason: cancellationReason || null,
  });
};

// ---------------- 11. Admin: List All ----------------
const listRentalRequests = async ({ status, customerId, page, limit }) => {
  const { rentalRequests, total } = await RentalRequest.findAll({
    status,
    customerId,
    page,
    limit,
  });

  return {
    rentalRequests,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ---------------- 11. Admin: Review ----------------
const reviewRentalRequest = async (requestId, payload) => {
  const rentalRequest = await RentalRequest.findById(requestId);
  if (!rentalRequest) throw buildError("Rental request not found", 404);

  const updates = {};
  if (payload.adminNotes !== undefined) updates.adminNotes = payload.adminNotes;
  if (payload.callNotes !== undefined) updates.callNotes = payload.callNotes;
  if (payload.estimatedRent !== undefined) updates.estimatedRent = payload.estimatedRent;
  if (payload.finalRent !== undefined) updates.finalRent = payload.finalRent;
  if (payload.status !== undefined) {
    if (!["under_review", "estimate_provided"].includes(payload.status)) {
      throw buildError("Review can only move status to under_review or estimate_provided", 400);
    }
    updates.status = payload.status;
  }

  if (!Object.keys(updates).length) throw buildError("No changes provided", 400);

  return RentalRequest.updateById(requestId, updates);
};

// ---------------- 12. Admin: Confirm ----------------
const confirmRentalRequest = async (requestId, payload, adminId) => {
  const rentalRequest = await RentalRequest.findById(requestId);
  if (!rentalRequest) throw buildError("Rental request not found", 404);

  const updates = {
    status: "confirmed",
    confirmedAt: new Date(),
    reviewedBy: adminId,
  };
  if (payload.finalRent !== undefined) updates.finalRent = payload.finalRent;

  return RentalRequest.updateById(requestId, updates);
};

// ---------------- 13. Admin: Assign Vehicle ----------------
const assignVehicle = async (requestId, { vehicleId }) => {
  const rentalRequest = await RentalRequest.findById(requestId);
  if (!rentalRequest) throw buildError("Rental request not found", 404);

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw buildError("Vehicle not found", 404);

  const [reqOverlap, tripOverlap] = await Promise.all([
    RentalRequest.vehicleHasOverlap(
      vehicleId,
      rentalRequest.pickupDate,
      rentalRequest.returnDate,
      requestId,
    ),
    Trip.vehicleHasOverlap(vehicleId, rentalRequest.pickupDate, rentalRequest.returnDate),
  ]);
  if (reqOverlap || tripOverlap) {
    throw buildError("Vehicle is already booked for an overlapping date range", 409);
  }

  return RentalRequest.updateById(requestId, {
    assignedVehicleId: vehicleId,
    status: "vehicle_assigned",
  });
};

// ---------------- 13. Admin: Assign Driver (+ trip hookup) ----------------
const assignDriver = async (requestId, { driverId }) => {
  const rentalRequest = await RentalRequest.findById(requestId);
  if (!rentalRequest) throw buildError("Rental request not found", 404);

  const driver = await User.findById(driverId);
  if (!driver || driver.role !== "driver") throw buildError("Driver not found", 404);

  const [reqOverlap, tripOverlap] = await Promise.all([
    RentalRequest.driverHasOverlap(
      driverId,
      rentalRequest.pickupDate,
      rentalRequest.returnDate,
      requestId,
    ),
    Trip.driverHasOverlap(driverId, rentalRequest.pickupDate, rentalRequest.returnDate),
  ]);
  if (reqOverlap || tripOverlap) {
    throw buildError("Driver is already booked for an overlapping date range", 409);
  }

  const updated = await RentalRequest.updateById(requestId, {
    assignedDriverId: driverId,
    status: "driver_assigned",
  });

  // Once both vehicle and driver are on the request, hand off to the Trip
  // module — this is the hookup between rental-request and trip.
  let trip = await Trip.findByRentalRequestId(requestId);
  if (!trip && updated.assignedVehicleId && updated.assignedDriverId) {
    trip = await Trip.create({
      rentalRequestId: updated.id,
      customerId: updated.customerId,
      vehicleId: updated.assignedVehicleId,
      driverId: updated.assignedDriverId,
      tripType: updated.tripType,
      pickupLocation: updated.pickupLocation,
      destination: updated.destination,
      returnLocation: updated.returnLocation,
      pickupDate: updated.pickupDate,
      pickupTime: updated.pickupTime,
      returnDate: updated.returnDate,
      returnTime: updated.returnTime,
      estimatedDistanceKm: updated.estimatedDistanceKm,
      finalRent: updated.finalRent,
      status: "confirmed",
    });
  }

  return { ...updated, tripId: trip?.id || null };
};

// ---------------- Admin: Reject ----------------
const rejectRentalRequest = async (requestId, { reason }) => {
  const rentalRequest = await RentalRequest.findById(requestId);
  if (!rentalRequest) throw buildError("Rental request not found", 404);

  return RentalRequest.updateById(requestId, {
    status: "rejected",
    cancellationReason: reason || null,
  });
};

export default {
  createRentalRequest,
  getMyRentalRequests,
  getRentalRequestById,
  cancelRentalRequest,
  listRentalRequests,
  reviewRentalRequest,
  confirmRentalRequest,
  assignVehicle,
  assignDriver,
  rejectRentalRequest,
};
