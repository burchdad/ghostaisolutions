import crypto from "crypto";
import { hasDatabaseConfig, query } from "@/lib/postgres";

let dbReady = false;

async function ensureDb() {
  if (dbReady || !hasDatabaseConfig()) return;
  await query(`
    CREATE TABLE IF NOT EXISTS cron_runs (
      id TEXT PRIMARY KEY,
      job_name TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TIMESTAMPTZ NOT NULL,
      finished_at TIMESTAMPTZ,
      duration_ms INTEGER,
      http_status INTEGER,
      error_message TEXT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `);
  await query("CREATE INDEX IF NOT EXISTS cron_runs_job_started_idx ON cron_runs (job_name, started_at DESC)");
  await query("CREATE INDEX IF NOT EXISTS cron_runs_status_idx ON cron_runs (status)");
  dbReady = true;
}

function makeRunId(jobName) {
  return `cron-${String(jobName).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`;
}

export async function startCronRun(jobName, metadata = {}) {
  if (!hasDatabaseConfig()) return null;
  try {
    await ensureDb();
    const run = {
      id: makeRunId(jobName),
      jobName,
      startedAt: new Date().toISOString(),
    };
    await query(
      `INSERT INTO cron_runs (id, job_name, status, started_at, metadata)
       VALUES ($1, $2, 'started', $3, $4)`,
      [run.id, jobName, run.startedAt, metadata]
    );
    return run;
  } catch {
    return null;
  }
}

export async function finishCronRun(run, { status, httpStatus = null, error = null, metadata = {} } = {}) {
  if (!run?.id || !hasDatabaseConfig()) return;
  try {
    await ensureDb();
    const finishedAt = new Date();
    const durationMs = Math.max(0, finishedAt.getTime() - new Date(run.startedAt).getTime());
    await query(
      `UPDATE cron_runs
       SET status = $2,
           finished_at = $3,
           duration_ms = $4,
           http_status = $5,
           error_message = $6,
           metadata = metadata || $7::jsonb
       WHERE id = $1`,
      [
        run.id,
        status,
        finishedAt.toISOString(),
        durationMs,
        httpStatus,
        error ? String(error).slice(0, 2000) : null,
        JSON.stringify(metadata),
      ]
    );
  } catch {
    // Cron logging must never break the cron itself.
  }
}

export function withCronLogging(jobName, handler) {
  return async function loggedCronHandler(request, context) {
    const run = await startCronRun(jobName, {
      method: request?.method || null,
      path: request?.nextUrl?.pathname || null,
    });

    try {
      const response = await handler(request, context);
      const httpStatus = response?.status || 200;
      await finishCronRun(run, {
        status: httpStatus >= 200 && httpStatus < 400 ? "success" : "failure",
        httpStatus,
      });
      return response;
    } catch (error) {
      await finishCronRun(run, {
        status: "failure",
        httpStatus: 500,
        error: error?.message || String(error),
      });
      throw error;
    }
  };
}
