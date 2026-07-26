import { NextResponse } from "next/server";
import { withCronLogging } from "@/lib/cronRuns";
import { fetchMetaConnectedAssets } from "@/lib/oauthProviders/meta";
import { getProviderConnectionAsync, getTokenWithSource, saveTokensAsync } from "@/lib/tokenStore";

function getCronSecret() {
  return process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
}

async function checkLinkedIn() {
  const { token, source, envKey } = getTokenWithSource("linkedin", { orgId: "default" });
  if (!token) return { platform: "linkedin", status: "missing", source, detail: `${envKey || "LINKEDIN_ACCESS_TOKEN"} not set` };

  try {
    const res = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) return { platform: "linkedin", status: "ok", source };
    if (res.status === 401) return { platform: "linkedin", status: "expired", source, detail: "Token rejected (401)" };
    if (res.status === 403) {
      return {
        platform: "linkedin",
        status: "ok",
        source,
        detail: "Token is present; /v2/userinfo returned 403, likely because the token lacks OIDC profile scope. Publishing permissions are validated during publish.",
      };
    }
    return { platform: "linkedin", status: "error", source, detail: `HTTP ${res.status}` };
  } catch (err) {
    return { platform: "linkedin", status: "error", source, detail: err.message };
  }
}

async function checkTwitter() {
  const apiKey = process.env.X_CONSUMER_KEY || process.env.X_API_KEY;
  const apiSecret = process.env.X_CONSUMER_SECRET || process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_SECRET || process.env.X_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    const missing = [
      ["X_CONSUMER_KEY", "X_API_KEY"],
      ["X_CONSUMER_SECRET", "X_API_SECRET"],
      ["X_ACCESS_TOKEN"],
      ["X_ACCESS_SECRET", "X_ACCESS_TOKEN_SECRET"],
    ]
      .filter((group) => !group.some((k) => process.env[k]))
      .map((group) => group.join(" or "))
      .join(", ");
    return { platform: "x", status: "missing", detail: `Missing: ${missing}` };
  }

  try {
    // Use Twitter OAuth1 to call /2/users/me — simple credential check
    const { TwitterApi } = await import("twitter-api-v2");
    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken,
      accessSecret,
    });
    const me = await client.v2.me();
    if (me?.data?.id) return { platform: "x", status: "ok", username: me.data.username };
    return { platform: "x", status: "error", detail: "No user data returned" };
  } catch (err) {
    const msg = err.message || String(err);
    if (msg.includes("401") || msg.includes("unauthorized") || msg.includes("Invalid")) {
      return { platform: "x", status: "expired", detail: msg };
    }
    return { platform: "x", status: "error", detail: msg };
  }
}

async function checkFacebook() {
  const orgId = "default";
  const storedFacebook = (await getProviderConnectionAsync("facebook", { orgId })) || {};
  const pageId = process.env.FACEBOOK_PAGE_ID || storedFacebook.pageId;
  const candidates = [
    { token: storedFacebook.accessToken, source: "stored" },
    { ...getTokenWithSource("facebook", { orgId }), source: "env" },
  ].filter((candidate) => candidate.token);

  if (!pageId) return { platform: "facebook", status: "missing", source: "config", detail: "FACEBOOK_PAGE_ID not set" };

  for (const candidate of candidates) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}?fields=name&access_token=${encodeURIComponent(candidate.token)}`,
        { cache: "no-store" }
      );
      if (res.ok) return { platform: "facebook", status: "ok", source: candidate.source };
    } catch (_) {
      // Try the next source before reporting failure.
    }
  }

  const metaConnection = await getProviderConnectionAsync("meta", { orgId });
  if (!metaConnection?.accessToken) {
    return { platform: "facebook", status: "expired", source: candidates[0]?.source || "missing", detail: "No durable Meta OAuth connection found; reconnect Meta Business Login." };
  }

  try {
    const assets = await fetchMetaConnectedAssets(metaConnection.accessToken);
    const page = assets.pages.find((candidate) => String(candidate.id) === String(pageId)) || assets.pages[0];
    if (!page?.pageAccessToken) {
      return { platform: "facebook", status: "missing", source: "meta", detail: "Meta connection did not return a page token." };
    }
    await saveTokensAsync("facebook", {
      orgId,
      accessToken: page.pageAccessToken,
      pageId: page.id,
      pageName: page.name,
      providerUserId: metaConnection.providerUserId,
      metaUserId: metaConnection.metaUserId,
      appScopedUserId: metaConnection.appScopedUserId,
      assets,
      connectedVia: "meta-token-health-refresh",
    }, { orgId });
    return { platform: "facebook", status: "ok", source: "meta-refresh" };
  } catch (err) {
    return { platform: "facebook", status: "expired", source: "meta", detail: err.message };
  }
}

async function notifySlack(results) {
  const webhook = process.env.SLACK_ALERTS_WEBHOOK;
  if (!webhook) return;

  const unhealthy = results.filter((r) => r.status !== "ok");
  if (!unhealthy.length) return; // All good — no noise

  const emoji = (status) => (status === "expired" ? "🔑" : status === "missing" ? "⚠️" : "❌");
  const label = (status) => (status === "expired" ? "Token Expired" : status === "missing" ? "Not Configured" : "Error");

  const fields = unhealthy.map((r) => ({
    type: "mrkdwn",
    text: `*${r.platform.toUpperCase()}:* ${emoji(r.status)} ${label(r.status)}${r.source ? ` (${r.source})` : ""}\n${r.detail || ""}`,
  }));

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: "🔑 Social Token Health Alert", emoji: true },
    },
    { type: "section", fields },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `${unhealthy.length} platform(s) need attention | ${new Date().toISOString()}`,
        },
      ],
    },
  ];

  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks }),
  });
}

async function handle(request) {
  const auth = request.headers.get("authorization") || "";
  const cronSecret = getCronSecret();
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [linkedin, twitter, facebook] = await Promise.allSettled([
    checkLinkedIn(),
    checkTwitter(),
    checkFacebook(),
  ]);

  const results = [linkedin, twitter, facebook].map((r) =>
    r.status === "fulfilled" ? r.value : { platform: "unknown", status: "error", detail: r.reason?.message }
  );

  await notifySlack(results);

  const allOk = results.every((r) => r.status === "ok");
  return NextResponse.json({
    healthy: allOk,
    results,
    timestamp: new Date().toISOString(),
  });
}

export const POST = withCronLogging("social-token-health", handle);
export const GET = withCronLogging("social-token-health", handle);
