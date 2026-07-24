import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { publishVariants } from "@/lib/socialPublish";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

export async function POST() {
  if (!ensureAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stamp = new Date().toISOString();
  const linkedinContent = `Ghost AI Solutions publishing verification - ${stamp}. Confirming LinkedIn API access after token refresh.`;
  const facebookContent = `Ghost AI Solutions publishing verification - ${stamp}. Confirming Facebook Page API access after token refresh.`;

  const [linkedin, facebook] = await Promise.all([
    publishVariants({ platform: "linkedin", linkedinContent }),
    publishVariants({ platform: "facebook", facebookContent }),
  ]);

  const results = {
    linkedin: linkedin.results?.linkedin,
    facebook: facebook.results?.facebook,
  };

  console.info("Social verification publish results", {
    linkedin: results.linkedin?.success || false,
    facebook: results.facebook?.success || false,
  });

  const success = Boolean(results.linkedin?.success && results.facebook?.success);
  return NextResponse.json({ success, results, timestamp: stamp }, { status: success ? 200 : 207 });
}
