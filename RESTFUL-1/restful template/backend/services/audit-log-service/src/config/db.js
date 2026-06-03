import pg from "pg";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
  override: true,
});

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

export let pool = new Pool({
  connectionString,
});

export const query = async (text, params) => {
  const result = await pool.query(text, params);
  return result;
};

const quoteIdentifier = (value) => `"${value.replaceAll('"', '""')}"`;

const createDatabaseIfMissing = async () => {
  const databaseUrl = new URL(connectionString);
  const databaseName = databaseUrl.pathname.slice(1);
  databaseUrl.pathname = "/postgres";

  const client = new pg.Client({ connectionString: databaseUrl.toString() });
  await client.connect();
  try {
    await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
  } finally {
    await client.end();
  }

  await pool.end().catch(() => {});
  pool = new Pool({ connectionString });
};

export const ensureAuditLogTable = async () => {
  try {
    await query("CREATE EXTENSION IF NOT EXISTS pgcrypto");
  } catch (error) {
    if (error.code !== "3D000") throw error;
    await createDatabaseIfMissing();
    await query("CREATE EXTENSION IF NOT EXISTS pgcrypto");
  }

  await query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      resource_id TEXT,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'SUCCESS',
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query("ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS resource_id TEXT");
  await query("ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb");

  await query("CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id)");
  await query("CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC)");
};
