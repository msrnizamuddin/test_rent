import reportService from "../service/report.service.js";

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

// ---------------- 28. Reports & Analytics ----------------
export const getUserReport = handle(async () => {
  const data = await reportService.getUserReport();
  return { message: "User report fetched successfully", data };
});

export const getVehicleReport = handle(async () => {
  const data = await reportService.getVehicleReport();
  return { message: "Vehicle report fetched successfully", data };
});

export const getDriverReport = handle(async () => {
  const data = await reportService.getDriverReport();
  return { message: "Driver report fetched successfully", data };
});

export const getTripReport = handle(async () => {
  const data = await reportService.getTripReport();
  return { message: "Trip report fetched successfully", data };
});

export const getFinancialReport = handle(async () => {
  const data = await reportService.getFinancialReport();
  return { message: "Financial report fetched successfully", data };
});
