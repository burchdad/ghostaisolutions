import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { optimizeVariant } from "@/lib/socialRepurpose";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

export async function POST(request) {
  if (!ensureAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const optimized = await optimizeVariant({
      platform: body.platform,
      text: body.text,
      title: body.title,
      excerpt: body.excerpt,
    });

    return NextResponse.json({ success: true, variant: optimized });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to optimize variant", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}