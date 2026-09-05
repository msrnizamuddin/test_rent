import Report from "../model/report.model.js";

export default {
  getUserReport: Report.getUserReport,
  getVehicleReport: Report.getVehicleReport,
  getDriverReport: Report.getDriverReport,
  getTripReport: Report.getTripReport,
  getFinancialReport: Report.getFinancialReport,
};
