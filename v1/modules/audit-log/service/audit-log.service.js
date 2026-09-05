import AuditLog from "../model/audit-log.model.js";

const getAll = async () => AuditLog.getAll();

const search = async (query) => {
  const { logs, total } = await AuditLog.search(query);
  const { page, limit } = query;
  return {
    logs,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// Exported for other modules to call directly (no HTTP round trip) once the
// superadmin panel integration decides which actions get logged.
export const recordAuditLog = AuditLog.record;

export default { getAll, search, recordAuditLog };
