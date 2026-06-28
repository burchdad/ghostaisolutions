import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  CLIENT_PORTAL_SESSION_COOKIE,
  clientPortalCookieOptions,
  logoutClientPortalAccount,
} from "@/lib/clientPortalData";

export const runtime = "nodejs";

export async function POST(request) {
  const sessionToken = cookies().get(CLIENT_PORTAL_SESSION_COOKIE)?.value || "";
  await logoutClientPortalAccount({ sessionToken });
  const response = NextResponse.redirect(new URL("/client-portal/sign-in", request.url), { status: 303 });
  response.cookies.set(CLIENT_PORTAL_SESSION_COOKIE, "", clientPortalCookieOptions(0));
  return response;
}
