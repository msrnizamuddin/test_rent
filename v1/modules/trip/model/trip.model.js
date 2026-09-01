import { query } from "../../../../config/db.js";

// Columns kept snake_case to mirror the `trips` table (see database/schema.sql).
// Every read maps rows back to camelCase so controllers/services never see snake_case.

const mapTrip = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    rentalRequestId: row.rental_request_id,
    customerId: row.customer_id,
    vehicleId: row.vehicle_id,
    driverId: row.driver_id,
    tripType: row.trip_type,
    pickupLocation: row.pickup_location,
    destination: row.destination,
    returnLocation: row.return_location,
    pickupDate: row.pickup_date,
    pickupTime: row.pickup_time,
    returnDate: row.return_date,
    returnTime: row.return_time,
    estimatedDistanceKm: row.estimated_distance_km,
    finalRent: row.final_rent,
    paymentStatus: row.payment_status,
    status: row.status,
    driverCurrentLocation: row.driver_current_location,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const COLUMNS = `
  id, rental_request_id, customer_id, vehicle_id, driver_id, trip_type,
  pickup_location, destination, return_location, pickup_date, pickup_time,
  return_date, return_time, estimated_distance_km, final_rent, payment_status,
  status, driver_current_location, started_at, completed_at, created_at, updated_at
`;

// Trip statuses that represent an active/ongoing hold on a vehicle or driver
// (used for double-booking checks). Cancelled/completed trips no longer block.
const NON_TERMINAL_TRIP_STATUSES = [
  "confirmed",
  "vehicle_assigned",
  "driver_assigned",
  "driver_accepted",
  "driver_on_the_way",
  "customer_picked_up",
  "trip_started",
  "trip_in_progress",
  "destination_reached",
  "return_started",
];

const findById = async (id) => {
  const { rows } = await query(`SELECT ${COLUMNS} FROM trips WHERE id = $1`, [id]);
  return mapTrip(rows[0]);
};

const findByRentalRequestId = async (rentalRequestId) => {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM trips WHERE rental_request_id = $1`,
    [rentalRequestId],
  );
  return mapTrip(rows[0]);
};

const create = async (payload) => {
  const { rows } = await query(
    `INSERT INTO trips (
       rental_request_id, customer_id, vehicle_id, driver_id, trip_type,
       pickup_location, destination, return_location, pickup_date, pickup_time,
       return_date, return_time, estimated_distance_km, final_rent, status
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
     ) RETURNING ${COLUMNS}`,
    [
      payload.rentalRequestId,
      payload.customerId,
      payload.vehicleId || null,
      payload.driverId || null,
      payload.tripType,
      JSON.stringify(payload.pickupLocation),
      JSON.stringify(payload.destination),
      payload.returnLocation ? JSON.stringify(payload.returnLocation) : null,
      payload.pickupDate,
      payload.pickupTime,
      payload.returnDate || null,
      payload.returnTime || null,
      payload.estimatedDistanceKm || null,
      payload.finalRent || null,
      payload.status || "confirmed",
    ],
  );

  return mapTrip(rows[0]);
};

const COLUMN_MAP = {
  vehicleId: "vehicle_id",
  driverId: "driver_id",
  finalRent: "final_rent",
  paymentStatus: "payment_status",
  status: "status",
  driverCurrentLocation: "driver_current_location",
  startedAt: "started_at",
  completedAt: "completed_at",
};

const JSON_COLUMNS = new Set(["driver_current_location"]);

const updateById = async (id, payload) => {
  const entries = Object.entries(payload).filter(([key]) => COLUMN_MAP[key] !== undefined);
  if (!entries.length) return findById(id);

  const setClauses = entries.map(([key], idx) => `${COLUMN_MAP[key]} = $${idx + 2}`);
  const values = entries.map(([key, value]) =>
    JSON_COLUMNS.has(COLUMN_MAP[key]) ? JSON.stringify(value) : value,
  );

  const { rows } = await query(
    `UPDATE trips SET ${setClauses.join(", ")}, updated_at = now()
     WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, ...values],
  );

  return mapTrip(rows[0]);
};

const findMineByCustomer = async ({ customerId, status, page, limit }) => {
  const conditions = ["customer_id = $1"];
  const values = [customerId];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  const offset = (page - 1) * limit;
  values.push(limit, offset);

  const [{ rows }, countResult] = await Promise.all([
    query(
      `SELECT ${COLUMNS} FROM trips ${where}
       ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    ),
    query(`SELECT COUNT(*)::int AS total FROM trips ${where}`, values.slice(0, -2)),
  ]);

  return { trips: rows.map(mapTrip), total: countResult.rows[0].total };
};

const findAssignedByDriver = async ({ driverId, status }) => {
  const conditions = ["driver_id = $1"];
  const values = [driverId];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const { rows } = await query(
    `SELECT ${COLUMNS} FROM trips WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC`,
    values,
  );
  return rows.map(mapTrip);
};

const findAll = async ({ status, driverId, customerId, page, limit }) => {
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (driverId) {
    values.push(driverId);
    conditions.push(`driver_id = $${values.length}`);
  }
  if (customerId) {
    values.push(customerId);
    conditions.push(`customer_id = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (page - 1) * limit;
  values.push(limit, offset);

  const [{ rows }, countResult] = await Promise.all([
    query(
      `SELECT ${COLUMNS} FROM trips ${where}
       ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    ),
    query(`SELECT COUNT(*)::int AS total FROM trips ${where}`, values.slice(0, -2)),
  ]);

  return { trips: rows.map(mapTrip), total: countResult.rows[0].total };
};

// Double-booking guard: does this vehicle/driver already have an active trip
// whose [pickup_date, COALESCE(return_date, pickup_date)] range overlaps the
// given range? excludeTripId lets an update ignore the trip's own row.
const vehicleHasOverlap = async (vehicleId, pickupDate, returnDate, excludeTripId) => {
  const { rows } = await query(
    `SELECT id FROM trips
     WHERE vehicle_id = $1
       AND status = ANY($2)
       AND ($5::uuid IS NULL OR id <> $5)
       AND pickup_date <= COALESCE($4::date, $3::date)
       AND COALESCE(return_date, pickup_date) >= $3::date`,
    [vehicleId, NON_TERMINAL_TRIP_STATUSES, pickupDate, returnDate || null, excludeTripId || null],
  );
  return rows.length > 0;
};

const driverHasOverlap = async (driverId, pickupDate, returnDate, excludeTripId) => {
  const { rows } = await query(
    `SELECT id FROM trips
     WHERE driver_id = $1
       AND status = ANY($2)
       AND ($5::uuid IS NULL OR id <> $5)
       AND pickup_date <= COALESCE($4::date, $3::date)
       AND COALESCE(return_date, pickup_date) >= $3::date`,
    [driverId, NON_TERMINAL_TRIP_STATUSES, pickupDate, returnDate || null, excludeTripId || null],
  );
  return rows.length > 0;
};

export default {
  findById,
  findByRentalRequestId,
  create,
  updateById,
  findMineByCustomer,
  findAssignedByDriver,
  findAll,
  vehicleHasOverlap,
  driverHasOverlap,
};
