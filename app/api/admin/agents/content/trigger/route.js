import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { run as runContentTrigger } from "@/app/api/agents/content/trigger/route";

export async function POST(request) {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cronSecret = process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
  if (!cronSecret) {
    return NextResponse.json({ error: "Missing CRON_SECRET" }, { status: 500 });
  }

  const triggerRequest = new Request(request.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cronSecret}`,
    },
    body: JSON.stringify({ source: "admin-dashboard" }),
  });

  return runContentTrigger(triggerRequest);
}
