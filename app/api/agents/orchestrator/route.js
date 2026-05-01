import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { getAdaptivePlan, runAdaptiveCycle } from "@/lib/orchestratorEngine";
import { getOrchestratorState } from "@/lib/orchestratorStore";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

function internalTriggerSecret() {
  return process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
}

function deriveBaseUrl(request) {
  const envBase = process.env.AUTOMATION_INTERNAL_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;
  if (envBase) return envBase;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return host ? `${proto}://${host}` : "";
}

export async function GET() {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plan = getAdaptivePlan();
  const state = getOrchestratorState();
  return NextResponse.json({
    state,
    plan,
    triggerEndpoint: "/api/agents/orchestrator/trigger",
  });
}

export async function POST(request) {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const action = body.action || "run-now";

  if (action === "analyze") {
    return NextResponse.json({ success: true, plan: getAdaptivePlan(), state: getOrchestratorState() });
  }

  if (action === "run-now") {
    const result = await runAdaptiveCycle({
      baseUrl: deriveBaseUrl(request),
      triggerSecret: internalTriggerSecret(),
      dryRun: Boolean(body.dryRun),
      forceTask: body.task || null,
      source: "admin-manual",
    });
    return NextResponse.json(result, { status: result.success ? 200 : 207 });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
