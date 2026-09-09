import Vehicle from "../model/vehicle.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
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

  return Vehicle.create(
    { ...payload, availabilityStatus: payload.availabilityStatus || "pending" },
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
