import { query } from "../../../../config/db.js";

const mapPayment = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    tripId: row.trip_id,
    customerId: row.customer_id,
    amount: row.amount,
    paymentType: row.payment_type,
    method: row.method,
    status: row.status,
    transactionId: row.transaction_id,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const COLUMNS = `
  id, trip_id, customer_id, amount, payment_type, method, status,
  transaction_id, paid_at, created_at, updated_at
`;

const create = async (payload) => {
  const { rows } = await query(
    `INSERT INTO payments (
       trip_id, customer_id, amount, payment_type, method, status,
       transaction_id, paid_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING ${COLUMNS}`,
    [
      payload.tripId,
      payload.customerId,
      payload.amount,
      payload.paymentType,
      payload.method,
      payload.status || "pending",
      payload.transactionId || null,
      payload.status === "paid" ? new Date() : null,
    ],
  );
  return mapPayment(rows[0]);
};

const findById = async (id) => {
  const { rows } = await query(`SELECT ${COLUMNS} FROM payments WHERE id = $1`, [id]);
  return mapPayment(rows[0]);
};

const findByTripId = async (tripId) => {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM payments WHERE trip_id = $1 ORDER BY created_at DESC`,
    [tripId],
  );
  return rows.map(mapPayment);
};

const findByCustomerId = async (customerId) => {
  const { rows } = await query(
    `SELECT ${COLUMNS} FROM payments WHERE customer_id = $1 ORDER BY created_at DESC`,
    [customerId],
  );
  return rows.map(mapPayment);
};

const search = async ({ status, method, customerId, page, limit }) => {
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (method) {
    values.push(method);
    conditions.push(`method = $${values.length}`);
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
      `SELECT ${COLUMNS} FROM payments ${where}
       ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    ),
    query(`SELECT COUNT(*)::int AS total FROM payments ${where}`, values.slice(0, -2)),
  ]);

  return { payments: rows.map(mapPayment), total: countResult.rows[0].total };
};

const updateStatus = async (id, { status, transactionId }) => {
  const setClauses = ["status = $2"];
  const values = [id, status];

  if (transactionId !== undefined) {
    values.push(transactionId);
    setClauses.push(`transaction_id = $${values.length}`);
  }
  if (status === "paid") {
    setClauses.push(`paid_at = now()`);
  }

  const { rows } = await query(
    `UPDATE payments SET ${setClauses.join(", ")}, updated_at = now()
     WHERE id = $1 RETURNING ${COLUMNS}`,
    values,
  );
  return mapPayment(rows[0]);
};

const sumPaidByTripId = async (tripId) => {
  const { rows } = await query(
    `SELECT COALESCE(SUM(amount), 0)::numeric AS total FROM payments WHERE trip_id = $1 AND status = 'paid'`,
    [tripId],
  );
  return Number(rows[0].total);
};

export default {
  create,
  findById,
  findByTripId,
  findByCustomerId,
  search,
  updateStatus,
  sumPaidByTripId,
};
