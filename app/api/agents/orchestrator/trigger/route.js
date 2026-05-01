import { NextResponse } from "next/server";
import { runAdaptiveCycle } from "@/lib/orchestratorEngine";

function schedulerSecret() {
  return process.env.RAILWAY_TRIGGER_SECRET || process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
}

function internalTriggerSecret() {
  return process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
}

function ensureSchedulerAuth(request) {
  const expected = schedulerSecret();
  const auth = request.headers.get("authorization") || "";
  return Boolean(expected) && auth === `Bearer ${expected}`;
}

function deriveBaseUrl(request) {
  const envBase = process.env.AUTOMATION_INTERNAL_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;
  if (envBase) return envBase;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return host ? `${proto}://${host}` : "";
}

async function handle(request) {
  if (!ensureSchedulerAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const dryRun = url.searchParams.get("dryRun") === "1";
  let forceTask = url.searchParams.get("task") || null;

  const body = await request.json().catch(() => ({}));
  if (!forceTask && body?.task) forceTask = body.task;

  const result = await runAdaptiveCycle({
    baseUrl: deriveBaseUrl(request),
    triggerSecret: internalTriggerSecret(),
    dryRun,
    forceTask,
    source: "railway",
  });

  return NextResponse.json(result, { status: result.success ? 200 : 207 });
}

export async function GET(request) {
  return handle(request);
}

export async function POST(request) {
  return handle(request);
}
