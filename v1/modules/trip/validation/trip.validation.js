import Joi from "joi";

const objectId = Joi.string().guid({ version: "uuidv4" });

const TRIP_STATUSES = [
  "confirmed",
  "vehicle_assigned",
  "driver_assigned",
  "driver_accepted",
  "driver_on_the_way",
  "customer_picked_up",
  "trip_started",
  "trip_in_progress",
  "destination_reached",
  "return_started",
  "trip_completed",
  "cancelled",
];

export const tripIdParamValidation = Joi.object({
  tripId: objectId.required(),
});

// ---------------- 16. Customer: My Trips ----------------
export const myTripsValidation = Joi.object({
  status: Joi.string().valid(...TRIP_STATUSES),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// ---------------- 15. Driver: Assigned Trips ----------------
export const assignedTripsValidation = Joi.object({
  status: Joi.string().valid(...TRIP_STATUSES),
});

// ---------------- 14. Admin: List All Trips ----------------
export const listTripsValidation = Joi.object({
  status: Joi.string().valid(...TRIP_STATUSES),
  driverId: objectId,
  customerId: objectId,
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// ---------------- 15. Driver: Status Transitions ----------------
export const driverActionValidation = Joi.object({
  action: Joi.string()
    .valid("accept", "reject", "on-the-way", "arrived", "picked-up", "start", "complete")
    .required(),
});

// ---------------- 16.6 Driver: Live Location ----------------
export const updateLocationValidation = Joi.object({
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
});

// ---------------- Admin: Cancel ----------------
export const cancelTripValidation = Joi.object({
  reason: Joi.string().trim().required(),
});
