import auditLogService from "../service/audit-log.service.js";

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

// Safe "get everything" — no filters, no conditions.
export const getAll = handle(async () => {
  const data = await auditLogService.getAll();
  return { message: "All audit logs fetched successfully", data };
});

export const searchAuditLogs = handle(async (req) => {
  const data = await auditLogService.search(req.query);
  return { message: "Audit logs fetched successfully", data };
});
