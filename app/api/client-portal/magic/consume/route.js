import { NextResponse } from "next/server";
import {
  CLIENT_PORTAL_SESSION_COOKIE,
  clientPortalCookieOptions,
  consumeClientPortalMagicLink,
} from "@/lib/clientPortalData";

export const runtime = "nodejs";

export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const result = await consumeClientPortalMagicLink({ token });
  if (!result?.ok) {
    const errorUrl = new URL("/client-portal/magic", request.url);
    errorUrl.searchParams.set("error", result?.error || "Magic link is invalid or expired.");
    return NextResponse.redirect(errorUrl, { status: 303 });
  }
  const portalUrl = new URL("/client-portal", request.url);
  portalUrl.searchParams.set("signin", "magic");
  const response = NextResponse.redirect(portalUrl, { status: 303 });
  response.cookies.set(CLIENT_PORTAL_SESSION_COOKIE, result.sessionToken, clientPortalCookieOptions());
  return response;
}
