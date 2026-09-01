import { query } from "../../../../config/db.js";

const mapVehicle = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    vehicleName: row.vehicle_name,
    brand: row.brand,
    vehicleModel: row.vehicle_model,
    categoryId: row.category_id,
    category: row.category, // populated by joined queries only
    vehicleType: row.vehicle_type,
    images: row.images,
    registrationNumber: row.registration_number,
    modelYear: row.model_year,
    seatingCapacity: row.seating_capacity,
    fuelType: row.fuel_type,
    transmission: row.transmission,
    isAC: row.is_ac,
    features: row.features,
    color: row.color,
    location: row.location,
    estimatedRentalRate: row.estimated_rental_rate,
    availabilityStatus: row.availability_status,
    driverRequired: row.driver_required,
    ownerInfo: row.owner_info,
    documents: row.documents,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const COLUMNS = `
  id, vehicle_name, brand, vehicle_model, category_id, vehicle_type, images,
  registration_number, model_year, seating_capacity, fuel_type, transmission,
  is_ac, features, color, location, estimated_rental_rate, availability_status,
  driver_required, owner_info, documents, created_by, updated_by, created_at, updated_at
`;

// Browsing only shows vehicles that are actually rentable/visible to the public
const PUBLICLY_VISIBLE_STATUSES = ["available", "assigned", "on-trip"];

const search = async ({
  search: searchTerm,
  brand,
  categoryId,
  location,
  vehicleType,
  seatingCapacity,
  minPrice,
  maxPrice,
  isAC,
  transmission,
  fuelType,
  availability,
  page,
  limit,
  sortBy,
  sortOrder,
}) => {
  const conditions = [];
  const values = [];

  if (availability) {
    values.push(availability);
    conditions.push(`availability_status = $${values.length}`);
  } else {
    values.push(PUBLICLY_VISIBLE_STATUSES);
    conditions.push(`availability_status = ANY($${values.length})`);
  }

  if (searchTerm) {
    values.push(`%${searchTerm}%`);
    const idx = values.length;
    conditions.push(`(vehicle_name ILIKE $${idx} OR brand ILIKE $${idx})`);
  }
  if (brand) {
    values.push(brand);
    conditions.push(`brand ILIKE $${values.length}`);
  }
  if (categoryId) {
    values.push(categoryId);
    conditions.push(`category_id = $${values.length}`);
  }
  if (vehicleType) {
    values.push(vehicleType);
    conditions.push(`vehicle_type = $${values.length}`);
  }
  if (seatingCapacity) {
    values.push(seatingCapacity);
    conditions.push(`seating_capacity >= $${values.length}`);
  }
  if (typeof isAC === "boolean") {
    values.push(isAC);
    conditions.push(`is_ac = $${values.length}`);
  }
  if (transmission) {
    values.push(transmission);
    conditions.push(`transmission = $${values.length}`);
  }
  if (fuelType) {
    values.push(fuelType);
    conditions.push(`fuel_type = $${values.length}`);
  }
  if (location) {
    values.push(`%${location}%`);
    const idx = values.length;
    conditions.push(
      `(location->>'city' ILIKE $${idx} OR location->>'district' ILIKE $${idx} OR location->>'address' ILIKE $${idx})`,
    );
  }
  if (minPrice !== undefined) {
    values.push(minPrice);
    conditions.push(`(estimated_rental_rate->>'perDay')::numeric >= $${values.length}`);
  }
  if (maxPrice !== undefined) {
    values.push(maxPrice);
    conditions.push(`(estimated_rental_rate->>'perDay')::numeric <= $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sortColumn =
    sortBy === "estimatedRentalRate.perDay"
      ? "(estimated_rental_rate->>'perDay')::numeric"
      : sortBy === "modelYear"
        ? "model_year"
        : "created_at";
  const direction = sortOrder === "asc" ? "ASC" : "DESC";

  const offset = (page - 1) * limit;
  values.push(limit, offset);

  const [{ rows }, countResult] = await Promise.all([
    query(
      `SELECT ${COLUMNS} FROM vehicles ${where}
       ORDER BY ${sortColumn} ${direction} LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    ),
    query(`SELECT COUNT(*)::int AS total FROM vehicles ${where}`, values.slice(0, -2)),
  ]);

  return { vehicles: rows.map(mapVehicle), total: countResult.rows[0].total };
};

const findPubliclyVisibleById = async (id) => {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM vehicles WHERE id = $1 AND availability_status = ANY($2)`,
    [id, PUBLICLY_VISIBLE_STATUSES],
  );
  return mapVehicle(rows[0]);
};

const findById = async (id) => {
  const { rows } = await query(`SELECT ${COLUMNS} FROM vehicles WHERE id = $1`, [id]);
  return mapVehicle(rows[0]);
};

const findByRegistrationNumber = async (registrationNumber, excludeId) => {
  const { rows } = await query(
    `SELECT id FROM vehicles WHERE registration_number = $1 AND ($2::uuid IS NULL OR id <> $2)`,
    [registrationNumber, excludeId || null],
  );
  return rows[0] || null;
};

const create = async (payload, userId) => {
  const { rows } = await query(
    `INSERT INTO vehicles (
       vehicle_name, brand, vehicle_model, category_id, vehicle_type, images,
       registration_number, model_year, seating_capacity, fuel_type, transmission,
       is_ac, features, color, location, estimated_rental_rate, availability_status,
       driver_required, owner_info, documents, created_by
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
     ) RETURNING ${COLUMNS}`,
    [
      payload.vehicleName,
      payload.brand,
      payload.vehicleModel,
      payload.categoryId || null,
      payload.vehicleType,
      payload.images || [],
      payload.registrationNumber,
      payload.modelYear,
      payload.seatingCapacity,
      payload.fuelType,
      payload.transmission,
      payload.isAC ?? true,
      payload.features || [],
      payload.color || null,
      payload.location ? JSON.stringify(payload.location) : null,
      payload.estimatedRentalRate ? JSON.stringify(payload.estimatedRentalRate) : null,
      payload.availabilityStatus || "pending",
      payload.driverRequired ?? false,
      payload.ownerInfo ? JSON.stringify(payload.ownerInfo) : null,
      JSON.stringify(payload.documents || []),
      userId,
    ],
  );

  return mapVehicle(rows[0]);
};

const COLUMN_MAP = {
  vehicleName: "vehicle_name",
  brand: "brand",
  vehicleModel: "vehicle_model",
  categoryId: "category_id",
  vehicleType: "vehicle_type",
  images: "images",
  registrationNumber: "registration_number",
  modelYear: "model_year",
  seatingCapacity: "seating_capacity",
  fuelType: "fuel_type",
  transmission: "transmission",
  isAC: "is_ac",
  features: "features",
  color: "color",
  location: "location",
  estimatedRentalRate: "estimated_rental_rate",
  availabilityStatus: "availability_status",
  driverRequired: "driver_required",
  ownerInfo: "owner_info",
  documents: "documents",
  updatedBy: "updated_by",
};

const JSON_COLUMNS = new Set(["location", "estimated_rental_rate", "owner_info", "documents"]);

const updateById = async (id, payload) => {
  const entries = Object.entries(payload).filter(([key]) => COLUMN_MAP[key] !== undefined);
  if (!entries.length) return findById(id);

  const setClauses = entries.map(([key], idx) => `${COLUMN_MAP[key]} = $${idx + 2}`);
  const values = entries.map(([key, value]) =>
    JSON_COLUMNS.has(COLUMN_MAP[key]) ? JSON.stringify(value) : value,
  );

  const { rows } = await query(
    `UPDATE vehicles SET ${setClauses.join(", ")}, updated_at = now()
     WHERE id = $1 RETURNING ${COLUMNS}`,
    [id, ...values],
  );

  return mapVehicle(rows[0]);
};

const deleteById = async (id) => {
  const { rows } = await query(`DELETE FROM vehicles WHERE id = $1 RETURNING id`, [id]);
  return rows[0] || null;
};

export default {
  search,
  findPubliclyVisibleById,
  findById,
  findByRegistrationNumber,
  create,
  updateById,
  deleteById,
};
