import { NextResponse } from "next/server";
import { CLIENT_PORTAL_SESSION_COOKIE, clientPortalCookieOptions, createClientPortalAccount } from "@/lib/clientPortalData";

export const runtime = "nodejs";

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

export async function POST(request) {
  const form = await request.formData();
  const payload = {
    name: clean(form.get("name"), 160),
    email: clean(form.get("email"), 240),
    inviteKey: clean(form.get("inviteKey"), 500),
    password: clean(form.get("password"), 500),
  };

  const result = await createClientPortalAccount(payload);
  if (!result?.ok) {
    const errorUrl = new URL("/client-portal/create-account", request.url);
    errorUrl.searchParams.set("error", result?.error || "Unable to create portal account.");
    if (payload.inviteKey) errorUrl.searchParams.set("invite", payload.inviteKey);
    if (payload.email) errorUrl.searchParams.set("email", payload.email);
    return NextResponse.redirect(errorUrl, { status: 303 });
  }

  if (result.account?.existing && !result.accessKey) {
    const signInUrl = new URL("/client-portal/sign-in", request.url);
    signInUrl.searchParams.set("email", payload.email);
    signInUrl.searchParams.set("error", "That client portal account already exists. Sign in with your email and password.");
    return NextResponse.redirect(signInUrl, { status: 303 });
  }

  const portalUrl = new URL("/client-portal", request.url);
  portalUrl.searchParams.set("created", result.account?.existing ? "existing" : "true");
  const response = NextResponse.redirect(portalUrl, { status: 303 });
  if (result.sessionToken) {
    response.cookies.set(CLIENT_PORTAL_SESSION_COOKIE, result.sessionToken, clientPortalCookieOptions());
  }
  return response;
}
