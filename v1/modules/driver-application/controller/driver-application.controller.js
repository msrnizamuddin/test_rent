import driverApplicationService from "../service/driver-application.service.js";

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

export const searchApplications = handle(async (req) => {
  const data = await driverApplicationService.searchApplications(req.query);
  return { message: "Driver applications fetched successfully", data };
});

// Safe "get everything" — no filters, no conditions.
export const getAll = handle(async () => {
  const data = await driverApplicationService.getAll();
  return { message: "All driver applications fetched successfully", data };
});

export const getApplicationById = handle(async (req) => {
  const data = await driverApplicationService.getApplicationById(req.params.applicationId);
  return { message: "Driver application fetched successfully", data };
});

// Public — no auth. Anyone can apply to become a driver.
export const submitApplication = handle(async (req) => {
  const data = await driverApplicationService.submitApplication(req.body);
  return {
    statusCode: 201,
    message: "Application received. Our team will review it and get back to you.",
    data,
  };
});

export const approveApplication = handle(async (req) => {
  const data = await driverApplicationService.approveApplication(req.params.applicationId, req.user.id);
  return { message: "Application approved — driver account created", data };
});

export const rejectApplication = handle(async (req) => {
  const data = await driverApplicationService.rejectApplication(
    req.params.applicationId,
    req.user.id,
    req.body.rejectionReason,
  );
  return { message: "Application rejected", data };
});
