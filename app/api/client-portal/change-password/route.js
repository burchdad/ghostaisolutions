import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CLIENT_PORTAL_SESSION_COOKIE, changeClientPortalPassword } from "@/lib/clientPortalData";

export const runtime = "nodejs";

export async function POST(request) {
  const form = await request.formData();
  const payload = {
    sessionToken: cookies().get(CLIENT_PORTAL_SESSION_COOKIE)?.value || "",
    currentPassword: String(form.get("currentPassword") || ""),
    newPassword: String(form.get("newPassword") || ""),
  };
  const result = await changeClientPortalPassword(payload);
  const url = new URL("/client-portal/account", request.url);
  url.searchParams.set(result?.ok ? "saved" : "error", result?.ok ? "true" : result?.error || "Unable to change password.");
  return NextResponse.redirect(url, { status: 303 });
}
