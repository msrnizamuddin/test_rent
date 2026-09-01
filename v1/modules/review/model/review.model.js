import { query } from "../../../../config/db.js";

const mapReview = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    tripId: row.trip_id,
    customerId: row.customer_id,
    driverId: row.driver_id,
    vehicleId: row.vehicle_id,
    driverRating: row.driver_rating,
    vehicleRating: row.vehicle_rating,
    reviewText: row.review_text,
    isHidden: row.is_hidden,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const COLUMNS = `
  id, trip_id, customer_id, driver_id, vehicle_id,
  driver_rating, vehicle_rating, review_text, is_hidden, created_at, updated_at
`;

// The trip module owns the `trips` table; this module only reads from it
// to validate ownership/status and to pull driver_id / vehicle_id.
const findTripById = async (tripId) => {
  const { rows } = await query(
    `SELECT id, customer_id, driver_id, vehicle_id, status FROM trips WHERE id = $1`,
    [tripId],
  );
  return rows[0] || null;
};

const create = async ({ tripId, customerId, driverId, vehicleId, driverRating, vehicleRating, reviewText }) => {
  const { rows } = await query(
    `INSERT INTO reviews (trip_id, customer_id, driver_id, vehicle_id, driver_rating, vehicle_rating, review_text)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${COLUMNS}`,
    [
      tripId,
      customerId,
      driverId || null,
      vehicleId || null,
      driverRating ?? null,
      vehicleRating ?? null,
      reviewText || null,
    ],
  );
  return mapReview(rows[0]);
};

const findById = async (id) => {
  const { rows } = await query(`SELECT ${COLUMNS} FROM reviews WHERE id = $1`, [id]);
  return mapReview(rows[0]);
};

const findMine = async (customerId) => {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM reviews WHERE customer_id = $1 ORDER BY created_at DESC`,
    [customerId],
  );
  return rows.map(mapReview);
};

const findVisibleForDriver = async (driverId) => {
  const [{ rows }, aggResult] = await Promise.all([
    query(
      `SELECT ${COLUMNS} FROM reviews WHERE driver_id = $1 AND is_hidden = false ORDER BY created_at DESC`,
      [driverId],
    ),
    query(
      `SELECT AVG(driver_rating)::numeric(10,2) AS avg_rating, COUNT(*)::int AS total
       FROM reviews WHERE driver_id = $1 AND is_hidden = false AND driver_rating IS NOT NULL`,
      [driverId],
    ),
  ]);

  return {
    reviews: rows.map(mapReview),
    averageRating: aggResult.rows[0].avg_rating !== null ? Number(aggResult.rows[0].avg_rating) : null,
    totalRatings: aggResult.rows[0].total,
  };
};

const findVisibleForVehicle = async (vehicleId) => {
  const [{ rows }, aggResult] = await Promise.all([
    query(
      `SELECT ${COLUMNS} FROM reviews WHERE vehicle_id = $1 AND is_hidden = false ORDER BY created_at DESC`,
      [vehicleId],
    ),
    query(
      `SELECT AVG(vehicle_rating)::numeric(10,2) AS avg_rating, COUNT(*)::int AS total
       FROM reviews WHERE vehicle_id = $1 AND is_hidden = false AND vehicle_rating IS NOT NULL`,
      [vehicleId],
    ),
  ]);

  return {
    reviews: rows.map(mapReview),
    averageRating: aggResult.rows[0].avg_rating !== null ? Number(aggResult.rows[0].avg_rating) : null,
    totalRatings: aggResult.rows[0].total,
  };
};

const findAll = async ({ driverId, vehicleId, isHidden, page, limit }) => {
  const conditions = [];
  const values = [];

  if (driverId) {
    values.push(driverId);
    conditions.push(`driver_id = $${values.length}`);
  }
  if (vehicleId) {
    values.push(vehicleId);
    conditions.push(`vehicle_id = $${values.length}`);
  }
  if (typeof isHidden === "boolean") {
    values.push(isHidden);
    conditions.push(`is_hidden = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (page - 1) * limit;
  values.push(limit, offset);

  const [{ rows }, countResult] = await Promise.all([
    query(
      `SELECT ${COLUMNS} FROM reviews ${where}
       ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    ),
    query(`SELECT COUNT(*)::int AS total FROM reviews ${where}`, values.slice(0, -2)),
  ]);

  return { reviews: rows.map(mapReview), total: countResult.rows[0].total };
};

const setHidden = async (id, isHidden) => {
  const { rows } = await query(
    `UPDATE reviews SET is_hidden = $2, updated_at = now() WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, isHidden],
  );
  return mapReview(rows[0]);
};

const deleteById = async (id) => {
  const { rows } = await query(`DELETE FROM reviews WHERE id = $1 RETURNING id`, [id]);
  return rows[0] || null;
};

export default {
  findTripById,
  create,
  findById,
  findMine,
  findVisibleForDriver,
  findVisibleForVehicle,
  findAll,
  setHidden,
  deleteById,
};
