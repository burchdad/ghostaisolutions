import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { buildMetaOAuthUrl } from "@/lib/oauthProviders/meta";

export async function GET(request) {
  const adminToken = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  if (!verifyAdminSessionToken(adminToken)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", "/admin/agents/social/facebook");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const next = request.nextUrl.searchParams.get("next") || "/admin/agents/social/facebook";
    const orgId = request.nextUrl.searchParams.get("orgId") || "default";
    const oauthUrl = buildMetaOAuthUrl({ next, orgId });
    return NextResponse.redirect(oauthUrl);
  } catch (error) {
    const fallback = new URL("/admin/agents/social/facebook", request.url);
    fallback.searchParams.set("status", "error");
    fallback.searchParams.set("message", error?.message || "Unable to start Meta OAuth");
    return NextResponse.redirect(fallback);
  }
}