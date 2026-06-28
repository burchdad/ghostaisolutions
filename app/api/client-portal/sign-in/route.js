import { NextResponse } from "next/server";
import { CLIENT_PORTAL_SESSION_COOKIE, clientPortalCookieOptions, signInClientPortalAccount } from "@/lib/clientPortalData";

export const runtime = "nodejs";

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

export async function POST(request) {
  const form = await request.formData();
  const payload = {
    email: clean(form.get("email"), 240),
    password: clean(form.get("password"), 500),
    accessKey: clean(form.get("accessKey"), 500),
  };

  const result = await signInClientPortalAccount(payload);
  if (!result?.ok) {
    const errorUrl = new URL("/client-portal/sign-in", request.url);
    errorUrl.searchParams.set("error", result?.error || "Unable to sign in.");
    if (payload.email) errorUrl.searchParams.set("email", payload.email);
    return NextResponse.redirect(errorUrl, { status: 303 });
  }

  const portalUrl = new URL("/client-portal", request.url);
  portalUrl.searchParams.set("signin", "true");
  const response = NextResponse.redirect(portalUrl, { status: 303 });
  if (result.sessionToken) {
    response.cookies.set(CLIENT_PORTAL_SESSION_COOKIE, result.sessionToken, clientPortalCookieOptions());
  }
  return response;
}
