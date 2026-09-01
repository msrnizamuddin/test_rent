import Trip from "../model/trip.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// ---------------- 16. Customer: My Trips ----------------
const getMyTrips = async (customerId, { status, page, limit }) => {
  const { trips, total } = await Trip.findMineByCustomer({ customerId, status, page, limit });
  return {
    trips,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ---------------- 15. Driver: Assigned Trips ----------------
const getAssignedTrips = async (driverId, { status }) => {
  return Trip.findAssignedByDriver({ driverId, status });
};

const getTripById = async (tripId, user) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw buildError("Trip not found", 404);

  if (user.role === "customer" && trip.customerId !== user.id) {
    throw buildError("Trip not found", 404);
  }
  if (user.role === "driver" && trip.driverId !== user.id) {
    throw buildError("Trip not found", 404);
  }

  return trip;
};

// ---------------- 14. Admin: List All Trips ----------------
const listTrips = async ({ status, driverId, customerId, page, limit }) => {
  const { trips, total } = await Trip.findAll({ status, driverId, customerId, page, limit });
  return {
    trips,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ---------------- 15. Driver: Status Transitions ----------------
// action -> [allowed current statuses, next status, extra column updates]
const ACTION_TRANSITIONS = {
  accept: {
    from: ["driver_assigned"],
    to: "driver_accepted",
  },
  reject: {
    from: ["driver_assigned", "driver_accepted"],
    to: "cancelled",
  },
  "on-the-way": {
    from: ["driver_accepted"],
    to: "driver_on_the_way",
  },
  arrived: {
    from: ["driver_on_the_way"],
    to: "destination_reached",
  },
  "picked-up": {
    from: ["driver_on_the_way", "destination_reached"],
    to: "customer_picked_up",
  },
  start: {
    from: ["customer_picked_up"],
    to: "trip_started",
    extra: () => ({ startedAt: new Date() }),
  },
  complete: {
    from: ["trip_started", "trip_in_progress"],
    to: "trip_completed",
    extra: () => ({ completedAt: new Date() }),
  },
};

const driverAction = async (tripId, driverId, { action }) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw buildError("Trip not found", 404);
  if (trip.driverId !== driverId) throw buildError("Trip not found", 404);

  const transition = ACTION_TRANSITIONS[action];
  if (!transition) throw buildError(`Unknown action '${action}'`, 400);

  if (!transition.from.includes(trip.status)) {
    throw buildError(
      `Cannot perform '${action}' while trip is in status '${trip.status}'`,
      400,
    );
  }

  return Trip.updateById(tripId, {
    status: transition.to,
    ...(transition.extra ? transition.extra() : {}),
  });
};

// ---------------- 16.6 Driver: Live Location ----------------
const updateLocation = async (tripId, driverId, { latitude, longitude }) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw buildError("Trip not found", 404);
  if (trip.driverId !== driverId) throw buildError("Trip not found", 404);

  return Trip.updateById(tripId, {
    driverCurrentLocation: { latitude, longitude, updatedAt: new Date() },
  });
};

// ---------------- Admin: Cancel ----------------
// Note: the `trips` table has no cancellation-reason column (unlike
// rental_requests) — `reason` is accepted for the audit trail/logs but has
// nowhere to persist on this row today.
const cancelTrip = async (tripId, { reason }) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw buildError("Trip not found", 404);
  if (trip.status === "trip_completed") {
    throw buildError("Cannot cancel a completed trip", 400);
  }

  console.log(`Trip ${tripId} cancelled by admin. Reason: ${reason || "(none provided)"}`);

  return Trip.updateById(tripId, { status: "cancelled" });
};

export default {
  getMyTrips,
  getAssignedTrips,
  getTripById,
  listTrips,
  driverAction,
  updateLocation,
  cancelTrip,
};
