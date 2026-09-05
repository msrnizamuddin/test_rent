import Dashboard from "../model/dashboard.model.js";

export default {
  getOverviewStats: Dashboard.getOverviewStats,
  getUserReport: Dashboard.getUserReport,
  getVehicleReport: Dashboard.getVehicleReport,
  getDriverReport: Dashboard.getDriverReport,
  getTripReport: Dashboard.getTripReport,
  getFinancialReport: Dashboard.getFinancialReport,
};
