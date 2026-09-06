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
// superadmin panel integration decides which actions get logged. Audit
// logging is a side effect, never the point of the call it's attached to
// (e.g. login) — a DB hiccup or a stale Prisma Client here must never take
// down the actual request, so failures are swallowed rather than thrown.
export const recordAuditLog = async (entry) => {
  try {
    return await AuditLog.record(entry);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[audit-log] failed to record entry:", entry.action, error.message);
    return null;
  }
};

export default { getAll, search, recordAuditLog };
