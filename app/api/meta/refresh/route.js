import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { appendAuditEvent } from "@/lib/auditLog";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import {
  computeExpiryDate,
  exchangeForLongLivedMetaToken,
  fetchMetaConnectedAssets,
} from "@/lib/oauthProviders/meta";
import { getProviderConnection, saveTokens } from "@/lib/tokenStore";

export async function POST(request) {
  const adminToken = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  if (!verifyAdminSessionToken(adminToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const orgId = String(body?.orgId || "default");
  const existing = getProviderConnection("meta", { orgId });

  if (!existing?.accessToken) {
    return NextResponse.json({ error: "No Meta connection found" }, { status: 404 });
  }

  try {
    const refreshed = await exchangeForLongLivedMetaToken(existing.accessToken);
    const assets = await fetchMetaConnectedAssets(refreshed.access_token);
    const primaryPage = assets.pages[0] || null;

    saveTokens(
      "meta",
      {
        ...existing,
        orgId,
        accessToken: refreshed.access_token,
        expiresIn: refreshed.expires_in || existing.expiresIn || null,
        expiresAt: computeExpiryDate(refreshed.expires_in || existing.expiresIn),
        assets,
        primaryPageId: primaryPage?.id || existing.primaryPageId || "",
      },
      { orgId }
    );

    if (primaryPage?.pageAccessToken && primaryPage?.id) {
      saveTokens(
        "facebook",
        {
          orgId,
          accessToken: primaryPage.pageAccessToken,
          pageId: primaryPage.id,
          pageName: primaryPage.name,
          providerUserId: existing.providerUserId,
          metaUserId: existing.metaUserId,
          appScopedUserId: existing.appScopedUserId,
          assets,
          connectedVia: "meta-oauth-refresh",
        },
        { orgId }
      );
    }

    appendAuditEvent("meta-oauth", {
      event: "oauth_refreshed",
      orgId,
      providerUserId: existing.providerUserId || "",
    });

    return NextResponse.json({ ok: true, expiresAt: computeExpiryDate(refreshed.expires_in || existing.expiresIn) }, { status: 200 });
  } catch (error) {
    appendAuditEvent("meta-oauth", {
      event: "oauth_refresh_failed",
      orgId,
      message: error?.message || "Unknown refresh error",
    });
    return NextResponse.json({ error: error?.message || "Refresh failed" }, { status: 500 });
  }
}