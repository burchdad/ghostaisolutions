import { NextResponse } from "next/server";
import { signInClientPortalAccount } from "@/lib/clientPortalData";

export const runtime = "nodejs";

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

export async function POST(request) {
  const form = await request.formData();
  const payload = {
    email: clean(form.get("email"), 240),
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
  portalUrl.searchParams.set("key", result.accessKey || payload.accessKey);
  portalUrl.searchParams.set("signin", "true");
  return NextResponse.redirect(portalUrl, { status: 303 });
}
