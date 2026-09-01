import { query } from "../../../../config/db.js";

const mapInvoice = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    tripId: row.trip_id,
    invoiceNumber: row.invoice_number,
    rentalCharge: row.rental_charge,
    driverCharge: row.driver_charge,
    additionalCharges: row.additional_charges,
    tax: row.tax,
    discount: row.discount,
    total: row.total,
    paidAmount: row.paid_amount,
    dueAmount: row.due_amount,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // populated only by joined queries (GET /mine)
    trip: row.trip_customer_id
      ? {
          id: row.trip_id,
          customerId: row.trip_customer_id,
          pickupDate: row.trip_pickup_date,
          returnDate: row.trip_return_date,
          status: row.trip_status,
        }
      : undefined,
  };
};

const COLUMNS = `
  id, trip_id, invoice_number, rental_charge, driver_charge, additional_charges,
  tax, discount, total, paid_amount, due_amount, payment_status, created_at, updated_at
`;

const create = async (payload) => {
  const { rows } = await query(
    `INSERT INTO invoices (
       trip_id, invoice_number, rental_charge, driver_charge, additional_charges,
       tax, discount, total, paid_amount, due_amount, payment_status
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING ${COLUMNS}`,
    [
      payload.tripId,
      payload.invoiceNumber,
      payload.rentalCharge,
      payload.driverCharge,
      payload.additionalCharges,
      payload.tax,
      payload.discount,
      payload.total,
      payload.paidAmount,
      payload.dueAmount,
      payload.paymentStatus,
    ],
  );
  return mapInvoice(rows[0]);
};

const findByInvoiceNumber = async (invoiceNumber) => {
  const { rows } = await query(`SELECT id FROM invoices WHERE invoice_number = $1`, [
    invoiceNumber,
  ]);
  return rows[0] || null;
};

const findByTripId = async (tripId) => {
  const { rows } = await query(`SELECT ${COLUMNS} FROM invoices WHERE trip_id = $1`, [tripId]);
  return mapInvoice(rows[0]);
};

const findById = async (id) => {
  const { rows } = await query(`SELECT ${COLUMNS} FROM invoices WHERE id = $1`, [id]);
  return mapInvoice(rows[0]);
};

const findByCustomerId = async (customerId) => {
  const { rows } = await query(
    `SELECT i.*, t.customer_id AS trip_customer_id, t.pickup_date AS trip_pickup_date,
            t.return_date AS trip_return_date, t.status AS trip_status
     FROM invoices i
     JOIN trips t ON t.id = i.trip_id
     WHERE t.customer_id = $1
     ORDER BY i.created_at DESC`,
    [customerId],
  );
  return rows.map(mapInvoice);
};

const search = async ({ paymentStatus, page, limit }) => {
  const conditions = [];
  const values = [];

  if (paymentStatus) {
    values.push(paymentStatus);
    conditions.push(`payment_status = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (page - 1) * limit;
  values.push(limit, offset);

  const [{ rows }, countResult] = await Promise.all([
    query(
      `SELECT ${COLUMNS} FROM invoices ${where}
       ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    ),
    query(`SELECT COUNT(*)::int AS total FROM invoices ${where}`, values.slice(0, -2)),
  ]);

  return { invoices: rows.map(mapInvoice), total: countResult.rows[0].total };
};

export default {
  create,
  findByInvoiceNumber,
  findByTripId,
  findById,
  findByCustomerId,
  search,
};
