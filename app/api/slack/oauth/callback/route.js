import { NextResponse } from "next/server";
import { appendAuditEvent } from "@/lib/auditLog";
import { saveTokensAsync } from "@/lib/tokenStore";

const SLACK_TOKEN_URL = "https://slack.com/api/oauth.v2.access";
const DEFAULT_NEXT_PATH = "/admin?slack=connected";

function siteUrl(request) {
  return String(
    process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.SITE_URL ||
      new URL(request.url).origin
  ).replace(/\/+$/, "");
}

function redirectUri(request) {
  return (
    process.env.SLACK_REDIRECT_URI ||
    `${siteUrl(request)}/api/slack/oauth/callback`
  );
}

function buildRedirect(request, params = {}) {
  const url = new URL(DEFAULT_NEXT_PATH, request.url);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
}

async function exchangeSlackCode({ code, request }) {
  const clientId = process.env.SLACK_CLIENT_ID || "";
  const clientSecret = process.env.SLACK_CLIENT_SECRET || "";

  if (!clientId || !clientSecret) {
    throw new Error("Slack OAuth is missing SLACK_CLIENT_ID or SLACK_CLIENT_SECRET.");
  }

  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri(request),
  });

  const response = await fetch(SLACK_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || "Slack OAuth token exchange failed.");
  }

  return data;
}

export async function GET(request) {
  const code = request.nextUrl.searchParams.get("code") || "";
  const error = request.nextUrl.searchParams.get("error") || "";

  if (error) {
    appendAuditEvent("slack-oauth", {
      event: "oauth_error",
      error,
    });

    return NextResponse.redirect(
      buildRedirect(request, {
        status: "error",
        message: error,
      })
    );
  }

  if (!code) {
    return NextResponse.redirect(
      buildRedirect(request, {
        status: "error",
        message: "Missing Slack OAuth code.",
      })
    );
  }

  try {
    const install = await exchangeSlackCode({ code, request });
    const teamId = install.team?.id || "default";
    const orgId = teamId;

    await saveTokensAsync(
      "slack",
      {
        orgId,
        teamId,
        teamName: install.team?.name || "",
        enterpriseId: install.enterprise?.id || "",
        enterpriseName: install.enterprise?.name || "",
        appId: install.app_id || "",
        botUserId: install.bot_user_id || "",
        accessToken: install.access_token || "",
        tokenType: install.token_type || "bot",
        scope: install.scope || "",
        authedUser: install.authed_user || null,
        incomingWebhook: install.incoming_webhook || null,
        connectedVia: "slack-oauth",
      },
      { orgId }
    );

    appendAuditEvent("slack-oauth", {
      event: "oauth_connected",
      teamId,
      teamName: install.team?.name || "",
      appId: install.app_id || "",
      botUserId: install.bot_user_id || "",
      hasIncomingWebhook: Boolean(install.incoming_webhook?.url),
    });

    return NextResponse.redirect(
      buildRedirect(request, {
        status: "connected",
        team: install.team?.name || teamId,
      })
    );
  } catch (err) {
    appendAuditEvent("slack-oauth", {
      event: "oauth_failed",
      message: err?.message || "Unknown Slack OAuth error",
    });

    return NextResponse.redirect(
      buildRedirect(request, {
        status: "error",
        message: err?.message || "Slack OAuth failed.",
      })
    );
  }
}
