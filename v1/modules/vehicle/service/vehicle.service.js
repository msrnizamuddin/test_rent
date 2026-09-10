// import Vehicle from "../model/vehicle.model.js";

// const buildError = (message, statusCode = 400) => {
//   const err = new Error(message);
//   err.statusCode = statusCode;
//   return err;
// };

// // A driver can only be the assignedDriver of one vehicle at a time — assigning
// // a second one is rejected rather than silently stealing the assignment.
// const assertDriverNotAlreadyAssigned = async (driverId, excludeVehicleId) => {
//   const conflict = await Vehicle.findActiveAssignmentForDriver(
//     driverId,
//     excludeVehicleId,
//   );
//   if (conflict) {
//     throw buildError(
//       `This driver is already assigned to ${conflict.vehicleName} (${conflict.registrationNumber}). Unassign it first.`,
//       409,
//     );
//   }
// };

// const assertIsDriver = async (driverId, fieldName) => {
//   const driver = await Vehicle.findDriverById(driverId);
//   if (!driver)
//     throw buildError(`${fieldName} must reference an existing driver`, 400);
// };

// // ---------------- 2.1 Search + 2.2 Filter (combined) ----------------
// const searchVehicles = async (query) => {
//   const { vehicles, total } = await Vehicle.search(query);
//   const { page, limit } = query;

//   return {
//     vehicles,
//     pagination: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   };
// };

// // Safe "get everything" — no filters, no conditions.
// const getAll = async () => Vehicle.getAll();

// // ---------------- 2.3 Vehicle Details ----------------
// // The /web (admin/manager) mount needs to open a vehicle regardless of its
// // status — most obviously right after creating one, while it still
// // defaults to "pending" — whereas /app (public site) must only ever
// // resolve a vehicle a customer could actually see in search results.
// const getVehicleById = async (vehicleId, isAdmin = false) => {
//   const vehicle = isAdmin
//     ? await Vehicle.findById(vehicleId)
//     : await Vehicle.findPubliclyVisibleById(vehicleId);
//   if (!vehicle) throw buildError("Vehicle not found or not available", 404);
//   return vehicle;
// };

// // ---------------- Vehicle Entry (module 7, superadmin/manager only) ----------------
// const createVehicle = async (payload, userId) => {
//   const existing = await Vehicle.findByRegistrationNumber(
//     payload.registrationNumber,
//   );
//   if (existing) throw buildError("Registration number already exists", 409);

//   if (payload.ownerDriverId) {
//     await assertIsDriver(payload.ownerDriverId, "ownerDriverId");
//   }

//   // A driver's own car defaults to being assigned to them, unless the
//   // caller explicitly set a different assignedDriverId.
//   const assignedDriverId =
//     payload.assignedDriverId ?? payload.ownerDriverId ?? null;

//   if (assignedDriverId && assignedDriverId !== payload.ownerDriverId) {
//     await assertIsDriver(assignedDriverId, "assignedDriverId");
//   }
//   if (assignedDriverId) {
//     await assertDriverNotAlreadyAssigned(assignedDriverId);
//   }

//   return Vehicle.create(
//     {
//       ...payload,
//       assignedDriverId,
//       availabilityStatus: payload.availabilityStatus || "pending",
//     },
//     userId,
//   );
// };

// const updateVehicle = async (vehicleId, payload, userId) => {
//   if (payload.registrationNumber) {
//     const existing = await Vehicle.findByRegistrationNumber(
//       payload.registrationNumber,
//       vehicleId,
//     );
//     if (existing) throw buildError("Registration number already in use", 409);
//   }

//   if (payload.ownerDriverId) {
//     await assertIsDriver(payload.ownerDriverId, "ownerDriverId");
//   }

//   if (payload.assignedDriverId) {
//     await assertIsDriver(payload.assignedDriverId, "assignedDriverId");
//     await assertDriverNotAlreadyAssigned(payload.assignedDriverId, vehicleId);
//   }

//   const vehicle = await Vehicle.updateById(vehicleId, {
//     ...payload,
//     updatedBy: userId,
//   });
//   if (!vehicle) throw buildError("Vehicle not found", 404);
//   return vehicle;
// };

// const deleteVehicle = async (vehicleId) => {
//   const deleted = await Vehicle.deleteById(vehicleId);
//   if (!deleted) throw buildError("Vehicle not found", 404);
//   return { deleted: true };
// };

// export default {
//   searchVehicles,
//   getAll,
//   getVehicleById,
//   createVehicle,
//   updateVehicle,
//   deleteVehicle,
// };

import Vehicle from "../model/vehicle.model.js";
import { prisma } from "../../../../config/db.js";
import {
  buildPricingRuleLookup,
  calculateVehiclePrice,
} from "../utils/vehicle-pricing.util.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// A driver can only be the assignedDriver of one vehicle at a time — assigning
// a second one is rejected rather than silently stealing the assignment.
const assertDriverNotAlreadyAssigned = async (driverId, excludeVehicleId) => {
  const conflict = await Vehicle.findActiveAssignmentForDriver(
    driverId,
    excludeVehicleId,
  );
  if (conflict) {
    throw buildError(
      `This driver is already assigned to ${conflict.vehicleName} (${conflict.registrationNumber}). Unassign it first.`,
      409,
    );
  }
};

const assertIsDriver = async (driverId, fieldName) => {
  const driver = await Vehicle.findDriverById(driverId);
  if (!driver)
    throw buildError(`${fieldName} must reference an existing driver`, 400);
};

// ---------------- 2.1 Search + 2.2 Filter (combined) ----------------
// `distanceKm` and `tripType` don't filter WHICH vehicles come back (that's
// still location/category/etc, handled entirely inside Vehicle.search) —
// they're only used here, after filtering, to price each matched vehicle:
// distanceKm feeds the per-km cost, tripType picks the right PricingRule
// when a rule is trip-type-specific (e.g. a discount-trip rate).
const searchVehicles = async (query) => {
  const { vehicles, total } = await Vehicle.search(query);
  const { page, limit, distanceKm, tripType } = query;

  const getRuleFor = await buildPricingRuleLookup(prisma, vehicles, tripType);

  const vehiclesWithPrice = vehicles.map((vehicle) => {
    const pricingRule = getRuleFor(vehicle);
    const priceInfo = calculateVehiclePrice({
      pricingRule,
      distanceKm,
      driverRequired: vehicle.driverRequired,
    });

    return {
      ...vehicle,
      // null when there's genuinely no PricingRule that matches this
      // vehicle (not even a generic fallback rule) — the frontend should
      // treat that as "price unavailable" rather than showing a bogus 0.
      price: priceInfo ? priceInfo.displayPrice : null,
    };
  });

  return {
    vehicles: vehiclesWithPrice,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Safe "get everything" — no filters, no conditions.
const getAll = async () => Vehicle.getAll();

// ---------------- 2.3 Vehicle Details ----------------
// The /web (admin/manager) mount needs to open a vehicle regardless of its
// status — most obviously right after creating one, while it still
// defaults to "pending" — whereas /app (public site) must only ever
// resolve a vehicle a customer could actually see in search results.
const getVehicleById = async (vehicleId, isAdmin = false) => {
  const vehicle = isAdmin
    ? await Vehicle.findById(vehicleId)
    : await Vehicle.findPubliclyVisibleById(vehicleId);
  if (!vehicle) throw buildError("Vehicle not found or not available", 404);
  return vehicle;
};

// ---------------- Vehicle Entry (module 7, superadmin/manager only) ----------------
const createVehicle = async (payload, userId) => {
  const existing = await Vehicle.findByRegistrationNumber(
    payload.registrationNumber,
  );
  if (existing) throw buildError("Registration number already exists", 409);

  if (payload.ownerDriverId) {
    await assertIsDriver(payload.ownerDriverId, "ownerDriverId");
  }

  // A driver's own car defaults to being assigned to them, unless the
  // caller explicitly set a different assignedDriverId.
  const assignedDriverId =
    payload.assignedDriverId ?? payload.ownerDriverId ?? null;

  if (assignedDriverId && assignedDriverId !== payload.ownerDriverId) {
    await assertIsDriver(assignedDriverId, "assignedDriverId");
  }
  if (assignedDriverId) {
    await assertDriverNotAlreadyAssigned(assignedDriverId);
  }

  return Vehicle.create(
    {
      ...payload,
      assignedDriverId,
      availabilityStatus: payload.availabilityStatus || "pending",
    },
    userId,
  );
};

const updateVehicle = async (vehicleId, payload, userId) => {
  if (payload.registrationNumber) {
    const existing = await Vehicle.findByRegistrationNumber(
      payload.registrationNumber,
      vehicleId,
    );
    if (existing) throw buildError("Registration number already in use", 409);
  }

  if (payload.ownerDriverId) {
    await assertIsDriver(payload.ownerDriverId, "ownerDriverId");
  }

  if (payload.assignedDriverId) {
    await assertIsDriver(payload.assignedDriverId, "assignedDriverId");
    await assertDriverNotAlreadyAssigned(payload.assignedDriverId, vehicleId);
  }

  const vehicle = await Vehicle.updateById(vehicleId, {
    ...payload,
    updatedBy: userId,
  });
  if (!vehicle) throw buildError("Vehicle not found", 404);
  return vehicle;
};

const deleteVehicle = async (vehicleId) => {
  const deleted = await Vehicle.deleteById(vehicleId);
  if (!deleted) throw buildError("Vehicle not found", 404);
  return { deleted: true };
};

export default {
  searchVehicles,
  getAll,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
