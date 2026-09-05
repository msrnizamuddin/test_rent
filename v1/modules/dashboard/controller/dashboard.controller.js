import dashboardService from "../service/dashboard.service.js";

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

// ---------------- 6.1 Super Admin Dashboard ----------------
export const getOverviewStats = handle(async () => {
  const data = await dashboardService.getOverviewStats();
  return { message: "Dashboard stats fetched successfully", data };
});

// ---------------- 28. Reports & Analytics ----------------
export const getUserReport = handle(async () => {
  const data = await dashboardService.getUserReport();
  return { message: "User report fetched successfully", data };
});

export const getVehicleReport = handle(async () => {
  const data = await dashboardService.getVehicleReport();
  return { message: "Vehicle report fetched successfully", data };
});

export const getDriverReport = handle(async () => {
  const data = await dashboardService.getDriverReport();
  return { message: "Driver report fetched successfully", data };
});

export const getTripReport = handle(async () => {
  const data = await dashboardService.getTripReport();
  return { message: "Trip report fetched successfully", data };
});

export const getFinancialReport = handle(async () => {
  const data = await dashboardService.getFinancialReport();
  return { message: "Financial report fetched successfully", data };
});
