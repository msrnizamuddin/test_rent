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
