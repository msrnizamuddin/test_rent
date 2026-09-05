import vehicleService from "../service/vehicle.service.js";

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

// Safe "get everything" — no filters, no conditions (staff-only, see route).
export const getAll = handle(async () => {
  const data = await vehicleService.getAll();
  return { message: "All vehicles fetched successfully", data };
});

// ---------------- 2.1 Search + 2.2 Filter ----------------
export const searchVehicles = handle(async (req) => {
  const data = await vehicleService.searchVehicles(req.query);
  return { message: "Vehicles fetched successfully", data };
});

// ---------------- 2.3 Vehicle Details ----------------
export const getVehicleById = handle(async (req) => {
  const data = await vehicleService.getVehicleById(req.params.vehicleId);
  return { message: "Vehicle details fetched successfully", data };
});

// ---------------- Vehicle Entry (module 7, superadmin/manager only) ----------------
export const createVehicle = handle(async (req) => {
  const data = await vehicleService.createVehicle(req.body, req.user.id);
  return { statusCode: 201, message: "Vehicle added successfully", data };
});

export const updateVehicle = handle(async (req) => {
  const data = await vehicleService.updateVehicle(
    req.params.vehicleId,
    req.body,
    req.user.id,
  );
  return { message: "Vehicle updated successfully", data };
});

export const deleteVehicle = handle(async (req) => {
  const data = await vehicleService.deleteVehicle(req.params.vehicleId);
  return { message: "Vehicle deleted successfully", data };
});
