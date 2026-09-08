import Vehicle from "../model/vehicle.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// A driver can only be the assignedDriver of one vehicle at a time — assigning
// a second one is rejected rather than silently stealing the assignment.
const assertDriverNotAlreadyAssigned = async (driverId, excludeVehicleId) => {
  const conflict = await Vehicle.findActiveAssignmentForDriver(driverId, excludeVehicleId);
  if (conflict) {
    throw buildError(
      `This driver is already assigned to ${conflict.vehicleName} (${conflict.registrationNumber}). Unassign it first.`,
      409,
    );
  }
};

const assertIsDriver = async (driverId, fieldName) => {
  const driver = await Vehicle.findDriverById(driverId);
  if (!driver) throw buildError(`${fieldName} must reference an existing driver`, 400);
};

// ---------------- 2.1 Search + 2.2 Filter (combined) ----------------
const searchVehicles = async (query) => {
  const { vehicles, total } = await Vehicle.search(query);
  const { page, limit } = query;

  return {
    vehicles,
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
const getVehicleById = async (vehicleId) => {
  const vehicle = await Vehicle.findPubliclyVisibleById(vehicleId);
  if (!vehicle) throw buildError("Vehicle not found or not available", 404);
  return vehicle;
};

// ---------------- Vehicle Entry (module 7, superadmin/manager only) ----------------
const createVehicle = async (payload, userId) => {
  const existing = await Vehicle.findByRegistrationNumber(payload.registrationNumber);
  if (existing) throw buildError("Registration number already exists", 409);

  if (payload.ownerDriverId) {
    await assertIsDriver(payload.ownerDriverId, "ownerDriverId");
  }

  // A driver's own car defaults to being assigned to them, unless the
  // caller explicitly set a different assignedDriverId.
  const assignedDriverId = payload.assignedDriverId ?? payload.ownerDriverId ?? null;

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

  const vehicle = await Vehicle.updateById(vehicleId, { ...payload, updatedBy: userId });
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
