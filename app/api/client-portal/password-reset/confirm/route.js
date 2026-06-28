import { NextResponse } from "next/server";
import { confirmClientPortalPasswordReset } from "@/lib/clientPortalData";

export const runtime = "nodejs";

export async function POST(request) {
  const form = await request.formData();
  const payload = {
    token: String(form.get("token") || "").trim(),
    password: String(form.get("password") || ""),
  };
  const result = await confirmClientPortalPasswordReset(payload);
  if (!result?.ok) {
    const url = new URL("/client-portal/reset-password", request.url);
    url.searchParams.set("token", payload.token);
    url.searchParams.set("error", result?.error || "Unable to reset password.");
    return NextResponse.redirect(url, { status: 303 });
  }
  const url = new URL("/client-portal/sign-in", request.url);
  url.searchParams.set("error", "Password updated. Sign in with your new password.");
  return NextResponse.redirect(url, { status: 303 });
}
