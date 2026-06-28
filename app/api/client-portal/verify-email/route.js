import { NextResponse } from "next/server";
import { verifyClientPortalEmail } from "@/lib/clientPortalData";

export const runtime = "nodejs";

export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const result = await verifyClientPortalEmail({ token });
  const target = new URL("/client-portal/sign-in", request.url);
  target.searchParams.set(
    "error",
    result?.ok ? "Email verified. You can sign in now." : result?.error || "Verification link is invalid or expired."
  );
  return NextResponse.redirect(target, { status: 303 });
}
