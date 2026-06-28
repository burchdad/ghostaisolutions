import { NextResponse } from "next/server";
import { requestClientPortalPasswordReset } from "@/lib/clientPortalData";

export const runtime = "nodejs";

export async function POST(request) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim();
  await requestClientPortalPasswordReset({ email });
  const url = new URL("/client-portal/reset-password", request.url);
  url.searchParams.set("sent", "true");
  if (email) url.searchParams.set("email", email);
  return NextResponse.redirect(url, { status: 303 });
}
