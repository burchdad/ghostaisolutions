import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { publishVariants } from "@/lib/socialPublish";

function isAuthorized(request) {
  const adminToken = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  if (verifyAdminSessionToken(adminToken)) return true;

  const cronSecret = process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
  const auth = request.headers.get("authorization") || "";
  return Boolean(cronSecret && auth === `Bearer ${cronSecret}`);
}

export async function POST(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = await publishVariants(body);
    return NextResponse.json(data, { status: data.success ? 200 : 207 });
  } catch (err) {
    console.error("Publish error:", err);
    return NextResponse.json(
      { error: "Failed to publish", details: err.message },
      { status: 500 }
    );
  }
}
