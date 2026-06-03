import { query } from "../config/db.js";

export const create = async (data) => {
  const {
    userId,
    action,
    resource,
    resourceId,
    description,
    status = "SUCCESS",
    metadata = {},
  } = data;

  const result = await query(
    `INSERT INTO audit_logs (user_id, action, resource, resource_id, description, status, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, action, resource, resourceId, description, status, metadata]
  );

  return result.rows[0];
};

export const findAll = async () => {
  const result = await query(
    `SELECT * FROM audit_logs ORDER BY created_at DESC`
  );

  return result.rows;
};

export const findById = async (id) => {
  const result = await query(
    `SELECT * FROM audit_logs WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

export const findByUserId = async (user_id) => {
  const result = await query(
    `SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC`,
    [user_id]
  );

  return result.rows;
};
