import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";

function resolveBaseUrl(request) {
  const preferred = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (preferred) return preferred.replace(/\/$/, "");
  if (request?.nextUrl?.origin) return request.nextUrl.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function POST(request) {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cronSecret = process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
  if (!cronSecret) {
    return NextResponse.json({ error: "Missing CRON_SECRET" }, { status: 500 });
  }

  const response = await fetch(`${resolveBaseUrl(request)}/api/agents/social/trigger`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cronSecret}`,
    },
    body: JSON.stringify({ source: "admin-dashboard" }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({ error: "Invalid trigger response" }));
  return NextResponse.json(payload, { status: response.status });
}