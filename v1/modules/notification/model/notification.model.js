import { query } from "../../../../config/db.js";

const mapNotification = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    channel: row.channel,
    isRead: row.is_read,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
};

const COLUMNS = `
  id, user_id, title, message, type, channel, is_read, metadata, created_at
`;

// Reusable helper other modules can import to push a notification
// (e.g. "Vehicle Assigned", "Trip Started").
const create = async ({ userId, title, message, type, channel, metadata }) => {
  const { rows } = await query(
    `INSERT INTO notifications (user_id, title, message, type, channel, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUMNS}`,
    [
      userId,
      title,
      message,
      type || null,
      channel || "in_app",
      metadata ? JSON.stringify(metadata) : null,
    ],
  );

  // TODO: dispatch via SMS/email/push provider once wired up, based on `channel`

  return mapNotification(rows[0]);
};

const findById = async (id) => {
  const { rows } = await query(`SELECT ${COLUMNS} FROM notifications WHERE id = $1`, [id]);
  return mapNotification(rows[0]);
};

const findForUser = async ({ userId, isRead, page, limit }) => {
  const conditions = ["user_id = $1"];
  const values = [userId];

  if (typeof isRead === "boolean") {
    values.push(isRead);
    conditions.push(`is_read = $${values.length}`);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  const offset = (page - 1) * limit;
  values.push(limit, offset);

  const [{ rows }, countResult] = await Promise.all([
    query(
      `SELECT ${COLUMNS} FROM notifications ${where}
       ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    ),
    query(`SELECT COUNT(*)::int AS total FROM notifications ${where}`, values.slice(0, -2)),
  ]);

  return { notifications: rows.map(mapNotification), total: countResult.rows[0].total };
};

const findAll = async ({ userId, channel, page, limit }) => {
  const conditions = [];
  const values = [];

  if (userId) {
    values.push(userId);
    conditions.push(`user_id = $${values.length}`);
  }
  if (channel) {
    values.push(channel);
    conditions.push(`channel = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (page - 1) * limit;
  values.push(limit, offset);

  const [{ rows }, countResult] = await Promise.all([
    query(
      `SELECT ${COLUMNS} FROM notifications ${where}
       ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    ),
    query(`SELECT COUNT(*)::int AS total FROM notifications ${where}`, values.slice(0, -2)),
  ]);

  return { notifications: rows.map(mapNotification), total: countResult.rows[0].total };
};

const markReadForUser = async (id, userId) => {
  const { rows } = await query(
    `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING ${COLUMNS}`,
    [id, userId],
  );
  return mapNotification(rows[0]);
};

const markAllReadForUser = async (userId) => {
  const { rowCount } = await query(
    `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
    [userId],
  );
  return { updated: rowCount };
};

const deleteForUser = async (id, userId) => {
  const { rows } = await query(
    `DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId],
  );
  return rows[0] || null;
};

export default {
  create,
  findById,
  findForUser,
  findAll,
  markReadForUser,
  markAllReadForUser,
  deleteForUser,
};
