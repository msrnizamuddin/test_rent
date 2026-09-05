import maintenanceService from "../service/maintenance.service.js";

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

// Safe "get everything" — no filters, no pagination.
export const getAll = handle(async () => {
  const data = await maintenanceService.getAll();
  return { message: "All maintenance records fetched successfully", data };
});

export const searchMaintenance = handle(async (req) => {
  const data = await maintenanceService.search(req.query);
  return { message: "Maintenance records fetched successfully", data };
});

export const getMaintenanceById = handle(async (req) => {
  const data = await maintenanceService.getById(req.params.maintenanceId);
  return { message: "Maintenance record fetched successfully", data };
});

export const createMaintenance = handle(async (req) => {
  const data = await maintenanceService.create(req.body, req.user?.id);
  return { statusCode: 201, message: "Maintenance record created successfully", data };
});

export const updateMaintenance = handle(async (req) => {
  const data = await maintenanceService.update(req.params.maintenanceId, req.body);
  return { message: "Maintenance record updated successfully", data };
});

export const deleteMaintenance = handle(async (req) => {
  const data = await maintenanceService.remove(req.params.maintenanceId);
  return { message: "Maintenance record deleted successfully", data };
});
