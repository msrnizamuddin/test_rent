import { prisma } from "../../../../config/db.js";

const SELECT = {
  id: true,
  actorId: true,
  action: true,
  entityType: true,
  entityId: true,
  metadata: true,
  ipAddress: true,
  createdAt: true,
};

// Reusable helper other modules can import to record an admin action
// (e.g. "vehicle.approved", "user.role_changed"). Not wired into every
// module yet — available for the superadmin panel integration pass.
const record = async ({ actorId, action, entityType, entityId, metadata, ipAddress }) =>
  prisma.auditLog.create({
    data: {
      actorId: actorId || null,
      action,
      entityType: entityType || null,
      entityId: entityId || null,
      metadata: metadata ?? null,
      ipAddress: ipAddress || null,
    },
    select: SELECT,
  });

// Safe "get everything" — no where clause, no pagination.
const getAll = async () =>
  prisma.auditLog.findMany({ select: SELECT, orderBy: { createdAt: "desc" } });

const search = async ({ actorId, action, entityType, page, limit }) => {
  const where = {
    ...(actorId ? { actorId } : {}),
    ...(action ? { action } : {}),
    ...(entityType ? { entityType } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      select: SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
};

export default { record, getAll, search };
