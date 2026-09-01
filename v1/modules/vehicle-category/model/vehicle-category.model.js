import { query } from "../../../../config/db.js";

const mapCategory = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const COLUMNS = `id, name, description, image, status, created_at, updated_at`;

const search = async ({ status }) => {
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await query(
    `SELECT ${COLUMNS} FROM vehicle_categories ${where} ORDER BY created_at DESC`,
    values,
  );

  return rows.map(mapCategory);
};

const findById = async (id) => {
  const { rows } = await query(`SELECT ${COLUMNS} FROM vehicle_categories WHERE id = $1`, [id]);
  return mapCategory(rows[0]);
};

const findByName = async (name, excludeId) => {
  const { rows } = await query(
    `SELECT id FROM vehicle_categories WHERE name = $1 AND ($2::uuid IS NULL OR id <> $2)`,
    [name, excludeId || null],
  );
  return rows[0] || null;
};

const create = async (payload) => {
  const { rows } = await query(
    `INSERT INTO vehicle_categories (name, description, image, status)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNS}`,
    [
      payload.name,
      payload.description || null,
      payload.image || null,
      payload.status || "active",
    ],
  );

  return mapCategory(rows[0]);
};

const COLUMN_MAP = {
  name: "name",
  description: "description",
  image: "image",
  status: "status",
};

const updateById = async (id, payload) => {
  const entries = Object.entries(payload).filter(([key]) => COLUMN_MAP[key] !== undefined);
  if (!entries.length) return findById(id);

  const setClauses = entries.map(([key], idx) => `${COLUMN_MAP[key]} = $${idx + 2}`);
  const values = entries.map(([, value]) => value);

  const { rows } = await query(
    `UPDATE vehicle_categories SET ${setClauses.join(", ")}, updated_at = now()
     WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, ...values],
  );

  return mapCategory(rows[0]);
};

const deleteById = async (id) => {
  const { rows } = await query(`DELETE FROM vehicle_categories WHERE id = $1 RETURNING id`, [id]);
  return rows[0] || null;
};

export default {
  search,
  findById,
  findByName,
  create,
  updateById,
  deleteById,
};
