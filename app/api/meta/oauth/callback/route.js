import { NextResponse } from "next/server";
import { appendAuditEvent } from "@/lib/auditLog";
import {
  computeExpiryDate,
  exchangeForLongLivedMetaToken,
  exchangeMetaCodeForToken,
  fetchMetaConnectedAssets,
  fetchMetaUserProfile,
  verifyMetaOAuthState,
} from "@/lib/oauthProviders/meta";
import { saveTokens } from "@/lib/tokenStore";

function buildRedirect(request, nextPath, params = {}) {
  const url = new URL(nextPath || "/admin/agents/social/facebook", request.url);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
}

export async function GET(request) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const errorDescription = request.nextUrl.searchParams.get("error_description");

  if (error) {
    return NextResponse.redirect(
      buildRedirect(request, "/admin/agents/social/facebook", {
        status: "error",
        message: errorDescription || error,
      })
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      buildRedirect(request, "/admin/agents/social/facebook", {
        status: "error",
        message: "Missing OAuth code or state",
      })
    );
  }

  try {
    const verifiedState = verifyMetaOAuthState(state);
    const orgId = verifiedState.orgId || "default";

    const shortLived = await exchangeMetaCodeForToken(code);
    const longLived = await exchangeForLongLivedMetaToken(shortLived.access_token);
    const [profile, assets] = await Promise.all([
      fetchMetaUserProfile(longLived.access_token),
      fetchMetaConnectedAssets(longLived.access_token),
    ]);

    const primaryPage = assets.pages[0] || null;

    saveTokens(
      "meta",
      {
        orgId,
        accessToken: longLived.access_token,
        tokenType: longLived.token_type || shortLived.token_type || "bearer",
        expiresIn: longLived.expires_in || shortLived.expires_in || null,
        expiresAt: computeExpiryDate(longLived.expires_in || shortLived.expires_in),
        scopes: shortLived.granted_scopes || [],
        providerUserId: profile.id,
        metaUserId: profile.id,
        appScopedUserId: profile.id,
        profile: { id: profile.id, name: profile.name || "" },
        assets,
        primaryPageId: primaryPage?.id || "",
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
          providerUserId: profile.id,
          metaUserId: profile.id,
          appScopedUserId: profile.id,
          assets,
          connectedVia: "meta-oauth",
        },
        { orgId }
      );
    }

    appendAuditEvent("meta-oauth", {
      event: "oauth_connected",
      orgId,
      providerUserId: profile.id,
      pageCount: assets.pages.length,
      adAccountCount: assets.adAccounts.length,
      businessCount: assets.businessManagers.length,
    });

    return NextResponse.redirect(
      buildRedirect(request, verifiedState.next || "/admin/agents/social/facebook", {
        status: "connected",
        orgId,
      })
    );
  } catch (err) {
    appendAuditEvent("meta-oauth", {
      event: "oauth_failed",
      message: err?.message || "Unknown Meta OAuth error",
    });

    return NextResponse.redirect(
      buildRedirect(request, "/admin/agents/social/facebook", {
        status: "error",
        message: err?.message || "Meta OAuth failed",
      })
    );
  }
}