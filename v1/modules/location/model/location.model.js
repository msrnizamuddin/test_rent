import { query } from "../../../../config/db.js";

const mapLocation = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    district: row.district,
    latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : null,
    longitude:
      row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : null,
    type: row.type,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const COLUMNS = `id, name, address, city, district, latitude, longitude, type, is_active, created_at, updated_at`;

const search = async ({ search: searchTerm, city, type, isActive }) => {
  const conditions = [];
  const values = [];

  if (searchTerm) {
    values.push(`%${searchTerm}%`);
    const idx = values.length;
    conditions.push(
      `(name ILIKE $${idx} OR address ILIKE $${idx} OR city ILIKE $${idx} OR district ILIKE $${idx})`,
    );
  }
  if (city) {
    values.push(`%${city}%`);
    conditions.push(`city ILIKE $${values.length}`);
  }
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (typeof isActive === "boolean") {
    values.push(isActive);
    conditions.push(`is_active = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await query(
    `SELECT ${COLUMNS} FROM locations ${where} ORDER BY created_at DESC`,
    values,
  );

  return rows.map(mapLocation);
};

const findById = async (id) => {
  const { rows } = await query(`SELECT ${COLUMNS} FROM locations WHERE id = $1`, [id]);
  return mapLocation(rows[0]);
};

const create = async (payload) => {
  const { rows } = await query(
    `INSERT INTO locations (name, address, city, district, latitude, longitude, type, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${COLUMNS}`,
    [
      payload.name,
      payload.address || null,
      payload.city || null,
      payload.district || null,
      payload.latitude ?? null,
      payload.longitude ?? null,
      payload.type || "popular",
      payload.isActive ?? true,
    ],
  );

  return mapLocation(rows[0]);
};

const COLUMN_MAP = {
  name: "name",
  address: "address",
  city: "city",
  district: "district",
  latitude: "latitude",
  longitude: "longitude",
  type: "type",
  isActive: "is_active",
};

const updateById = async (id, payload) => {
  const entries = Object.entries(payload).filter(([key]) => COLUMN_MAP[key] !== undefined);
  if (!entries.length) return findById(id);

  const setClauses = entries.map(([key], idx) => `${COLUMN_MAP[key]} = $${idx + 2}`);
  const values = entries.map(([, value]) => value);

  const { rows } = await query(
    `UPDATE locations SET ${setClauses.join(", ")}, updated_at = now()
     WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, ...values],
  );

  return mapLocation(rows[0]);
};

const deleteById = async (id) => {
  const { rows } = await query(`DELETE FROM locations WHERE id = $1 RETURNING id`, [id]);
  return rows[0] || null;
};

export default {
  search,
  findById,
  create,
  updateById,
  deleteById,
};
