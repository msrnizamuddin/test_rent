import { query } from "../../../../config/db.js";

// Columns kept snake_case to mirror the `rental_requests` table (see
// database/schema.sql). Every read maps rows back to camelCase so
// controllers/services never see snake_case.

const mapRentalRequest = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    customerId: row.customer_id,
    tripType: row.trip_type,
    vehicleId: row.vehicle_id,
    pickupLocation: row.pickup_location,
    destination: row.destination,
    returnLocation: row.return_location,
    pickupDate: row.pickup_date,
    pickupTime: row.pickup_time,
    returnDate: row.return_date,
    returnTime: row.return_time,
    passengerCount: row.passenger_count,
    driverRequired: row.driver_required,
    specialInstructions: row.special_instructions,
    contactNumber: row.contact_number,
    estimatedDistanceKm: row.estimated_distance_km,
    estimatedRent: row.estimated_rent,
    finalRent: row.final_rent,
    status: row.status,
    assignedVehicleId: row.assigned_vehicle_id,
    assignedDriverId: row.assigned_driver_id,
    adminNotes: row.admin_notes,
    callNotes: row.call_notes,
    cancellationReason: row.cancellation_reason,
    confirmedAt: row.confirmed_at,
    reviewedBy: row.reviewed_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const COLUMNS = `
  id, customer_id, trip_type, vehicle_id, pickup_location, destination,
  return_location, pickup_date, pickup_time, return_date, return_time,
  passenger_count, driver_required, special_instructions, contact_number,
  estimated_distance_km, estimated_rent, final_rent, status,
  assigned_vehicle_id, assigned_driver_id, admin_notes, call_notes,
  cancellation_reason, confirmed_at, reviewed_by, created_at, updated_at
`;

// Requests in these statuses no longer hold a claim on a vehicle/driver.
const NON_TERMINAL_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "estimate_provided",
  "waiting_confirmation",
  "confirmed",
  "vehicle_assigned",
  "driver_assigned",
  "trip_started",
];

const CANCELLABLE_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "estimate_provided",
  "waiting_confirmation",
];

const create = async (payload, customerId) => {
  const { rows } = await query(
    `INSERT INTO rental_requests (
       customer_id, trip_type, vehicle_id, pickup_location, destination,
       return_location, pickup_date, pickup_time, return_date, return_time,
       passenger_count, driver_required, special_instructions, contact_number,
       estimated_distance_km, estimated_rent, status
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
     ) RETURNING ${COLUMNS}`,
    [
      customerId,
      payload.tripType,
      payload.vehicleId || null,
      JSON.stringify(payload.pickupLocation),
      JSON.stringify(payload.destination),
      payload.returnLocation ? JSON.stringify(payload.returnLocation) : null,
      payload.pickupDate,
      payload.pickupTime,
      payload.returnDate || null,
      payload.returnTime || null,
      payload.passengerCount ?? 1,
      payload.driverRequired ?? false,
      payload.specialInstructions || null,
      payload.contactNumber,
      payload.estimatedDistanceKm || null,
      payload.estimatedRent ? JSON.stringify(payload.estimatedRent) : null,
      payload.status || "submitted",
    ],
  );

  return mapRentalRequest(rows[0]);
};

const findById = async (id) => {
  const { rows } = await query(`SELECT ${COLUMNS} FROM rental_requests WHERE id = $1`, [id]);
  return mapRentalRequest(rows[0]);
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
      `SELECT ${COLUMNS} FROM rental_requests ${where}
       ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    ),
    query(`SELECT COUNT(*)::int AS total FROM rental_requests ${where}`, values.slice(0, -2)),
  ]);

  return { rentalRequests: rows.map(mapRentalRequest), total: countResult.rows[0].total };
};

const findAll = async ({ status, customerId, page, limit }) => {
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
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
      `SELECT ${COLUMNS} FROM rental_requests ${where}
       ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    ),
    query(`SELECT COUNT(*)::int AS total FROM rental_requests ${where}`, values.slice(0, -2)),
  ]);

  return { rentalRequests: rows.map(mapRentalRequest), total: countResult.rows[0].total };
};

const COLUMN_MAP = {
  vehicleId: "vehicle_id",
  estimatedRent: "estimated_rent",
  finalRent: "final_rent",
  status: "status",
  assignedVehicleId: "assigned_vehicle_id",
  assignedDriverId: "assigned_driver_id",
  adminNotes: "admin_notes",
  callNotes: "call_notes",
  cancellationReason: "cancellation_reason",
  confirmedAt: "confirmed_at",
  reviewedBy: "reviewed_by",
};

const JSON_COLUMNS = new Set(["estimated_rent"]);

const updateById = async (id, payload) => {
  const entries = Object.entries(payload).filter(([key]) => COLUMN_MAP[key] !== undefined);
  if (!entries.length) return findById(id);

  const setClauses = entries.map(([key], idx) => `${COLUMN_MAP[key]} = $${idx + 2}`);
  const values = entries.map(([key, value]) =>
    JSON_COLUMNS.has(COLUMN_MAP[key]) ? JSON.stringify(value) : value,
  );

  const { rows } = await query(
    `UPDATE rental_requests SET ${setClauses.join(", ")}, updated_at = now()
     WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, ...values],
  );

  return mapRentalRequest(rows[0]);
};

// Double-booking guard against other *rental requests* that already hold a
// claim on this vehicle/driver (mirrors trip.model's vehicleHasOverlap /
// driverHasOverlap, which covers the trips table once a trip exists).
const vehicleHasOverlap = async (vehicleId, pickupDate, returnDate, excludeRequestId) => {
  const { rows } = await query(
    `SELECT id FROM rental_requests
     WHERE assigned_vehicle_id = $1
       AND status = ANY($2)
       AND id <> $5
       AND pickup_date <= COALESCE($4::date, $3::date)
       AND COALESCE(return_date, pickup_date) >= $3::date`,
    [vehicleId, NON_TERMINAL_STATUSES, pickupDate, returnDate || null, excludeRequestId],
  );
  return rows.length > 0;
};

const driverHasOverlap = async (driverId, pickupDate, returnDate, excludeRequestId) => {
  const { rows } = await query(
    `SELECT id FROM rental_requests
     WHERE assigned_driver_id = $1
       AND status = ANY($2)
       AND id <> $5
       AND pickup_date <= COALESCE($4::date, $3::date)
       AND COALESCE(return_date, pickup_date) >= $3::date`,
    [driverId, NON_TERMINAL_STATUSES, pickupDate, returnDate || null, excludeRequestId],
  );
  return rows.length > 0;
};

export { CANCELLABLE_STATUSES };

export default {
  create,
  findById,
  findMineByCustomer,
  findAll,
  updateById,
  vehicleHasOverlap,
  driverHasOverlap,
};
