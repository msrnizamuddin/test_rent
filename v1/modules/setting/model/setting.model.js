import { prisma } from "../../../../config/db.js";

const getAll = async () => {
  const rows = await prisma.setting.findMany({ orderBy: { key: "asc" } });
  // Flatten [{key,value}] into a single {key: value} object — this is a
  // small, fixed set of site settings, not a paginated resource.
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
};

const get = async (key) => {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row ? row.value : null;
};

const set = async (key, value) =>
  prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });

export default { getAll, get, set };
