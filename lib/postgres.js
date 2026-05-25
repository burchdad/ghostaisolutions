import pg from "pg";

const { Pool } = pg;

let pool = null;

function connectionString() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

function needsSsl(url) {
  return /^postgres(ql)?:\/\//i.test(url) && !/localhost|127\.0\.0\.1/i.test(url);
}

export function hasDatabaseConfig() {
  return Boolean(connectionString());
}

export function getPostgresPool() {
  const url = connectionString();
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: url,
      ssl: needsSsl(url) ? { rejectUnauthorized: false } : undefined,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
    });
  }

  return pool;
}

export async function query(text, params = []) {
  return getPostgresPool().query(text, params);
}
