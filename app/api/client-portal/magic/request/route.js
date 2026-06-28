import { NextResponse } from "next/server";
import { requestClientPortalMagicLink } from "@/lib/clientPortalData";

export const runtime = "nodejs";

export async function POST(request) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim();
  await requestClientPortalMagicLink({ email });
  const url = new URL("/client-portal/magic", request.url);
  url.searchParams.set("sent", "true");
  if (email) url.searchParams.set("email", email);
  return NextResponse.redirect(url, { status: 303 });
}
