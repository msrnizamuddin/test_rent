import Joi from "joi";

const objectId = Joi.string().guid({ version: "uuidv4" });

const locationSchema = Joi.object({
  address: Joi.string().trim().optional(),
  city: Joi.string().trim().required(),
  district: Joi.string().trim().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
});

// ---------------- 3. Create Rental Request ----------------
export const createRentalRequestValidation = Joi.object({
  tripType: Joi.string().valid("single", "round", "down").required(),
  vehicleId: objectId.optional(), // customer may not know the exact vehicle yet
  pickupLocation: locationSchema.required(),
  destination: locationSchema.required(),
  returnLocation: locationSchema.when("tripType", {
    is: "round",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  pickupDate: Joi.date().iso().required(),
  pickupTime: Joi.string().trim().required(),
  returnDate: Joi.date().iso().when("tripType", {
    is: "round",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  returnTime: Joi.string().trim().when("tripType", {
    is: "round",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  passengerCount: Joi.number().integer().min(1).default(1),
  driverRequired: Joi.boolean().default(false),
  specialInstructions: Joi.string().trim().allow("").optional(),
  contactNumber: Joi.string().trim().required(),
});

export const requestIdParamValidation = Joi.object({
  requestId: objectId.required(),
});

// ---------------- 10. Customer: My Requests ----------------
export const myRentalRequestsValidation = Joi.object({
  status: Joi.string().valid(
    "draft",
    "submitted",
    "under_review",
    "estimate_provided",
    "waiting_confirmation",
    "confirmed",
    "vehicle_assigned",
    "driver_assigned",
    "trip_started",
    "trip_completed",
    "cancelled",
    "rejected",
  ),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const cancelRentalRequestValidation = Joi.object({
  cancellationReason: Joi.string().trim().allow("").optional(),
});

// ---------------- 11. Admin: List ----------------
export const listRentalRequestsValidation = Joi.object({
  status: Joi.string().valid(
    "draft",
    "submitted",
    "under_review",
    "estimate_provided",
    "waiting_confirmation",
    "confirmed",
    "vehicle_assigned",
    "driver_assigned",
    "trip_started",
    "trip_completed",
    "cancelled",
    "rejected",
  ),
  customerId: objectId,
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const rentEstimateSchema = Joi.object({
  baseFare: Joi.number().min(0),
  perKmRate: Joi.number().min(0),
  estimatedDistanceKm: Joi.number().min(0),
  distanceFare: Joi.number().min(0),
  driverCharge: Joi.number().min(0),
  serviceCharge: Joi.number().min(0),
  tax: Joi.number().min(0),
  total: Joi.number().min(0),
  note: Joi.string(),
}).unknown(true);

// ---------------- 11. Admin: Review ----------------
export const reviewRentalRequestValidation = Joi.object({
  adminNotes: Joi.string().trim().allow("").optional(),
  callNotes: Joi.string().trim().allow("").optional(),
  estimatedRent: rentEstimateSchema.optional(),
  finalRent: Joi.number().min(0).optional(),
  status: Joi.string().valid("under_review", "estimate_provided").optional(),
}).min(1);

// ---------------- 12. Admin: Confirm ----------------
export const confirmRentalRequestValidation = Joi.object({
  finalRent: Joi.number().min(0).optional(),
});

// ---------------- 13. Admin: Assign Vehicle / Driver ----------------
export const assignVehicleValidation = Joi.object({
  vehicleId: objectId.required(),
});

export const assignDriverValidation = Joi.object({
  driverId: objectId.required(),
});

export const rejectRentalRequestValidation = Joi.object({
  reason: Joi.string().trim().required(),
});
