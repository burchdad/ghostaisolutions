import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { appendAuditEvent } from "@/lib/auditLog";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { revokeMetaAccess } from "@/lib/oauthProviders/meta";
import { deleteToken, getProviderConnection } from "@/lib/tokenStore";

export async function POST(request) {
  const adminToken = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  if (!verifyAdminSessionToken(adminToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const orgId = String(body?.orgId || "default");
  const connection = getProviderConnection("meta", { orgId });

  try {
    if (connection?.accessToken) {
      await revokeMetaAccess(connection.accessToken);
    }
  } catch (error) {
    appendAuditEvent("meta-oauth", {
      event: "oauth_disconnect_revoke_failed",
      orgId,
      message: error?.message || "Unknown revoke error",
    });
  }

  deleteToken("meta", { orgId });
  deleteToken("facebook", { orgId });

  appendAuditEvent("meta-oauth", {
    event: "oauth_disconnected",
    orgId,
    providerUserId: connection?.providerUserId || "",
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}