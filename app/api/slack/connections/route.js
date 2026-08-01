import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { resolveSlackApprovalDestination } from "@/lib/socialApproval";
import { listProviderConnectionsAsync } from "@/lib/tokenStore";

function isAuthorized(request) {
  const sessionToken = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  if (verifyAdminSessionToken(sessionToken)) return true;

  const secret = process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
  const authHeader = request.headers.get("authorization") || "";
  return Boolean(secret && authHeader === `Bearer ${secret}`);
}

function sanitizeConnection(connection) {
  return {
    orgId: connection.orgId || "",
    teamId: connection.teamId || "",
    teamName: connection.teamName || "",
    appId: connection.appId || "",
    botUserId: connection.botUserId || "",
    scope: connection.scope || "",
    hasAccessToken: Boolean(connection.accessToken),
    hasIncomingWebhook: Boolean(connection.incomingWebhook?.url),
    incomingWebhookChannel:
      connection.incomingWebhook?.channel ||
      connection.incomingWebhook?.channel_name ||
      "",
    incomingWebhookChannelId: connection.incomingWebhook?.channel_id || "",
    connectedVia: connection.connectedVia || "",
    savedAt: connection.savedAt || "",
    updatedAt: connection.updatedAt || "",
  };
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const connections = await listProviderConnectionsAsync("slack").catch(() => []);
  const destination = await resolveSlackApprovalDestination();

  return NextResponse.json({
    ok: true,
    connectionCount: connections.length,
    connections: connections.map(sanitizeConnection),
    approvalDestination: destination
      ? {
          type: destination.type,
          source: destination.source,
          teamId: destination.teamId || "",
          teamName: destination.teamName || "",
          channel: destination.channel || "",
          hasUrl: Boolean(destination.url),
          hasToken: Boolean(destination.token),
        }
      : null,
    requiredTeamName:
      process.env.SLACK_SOCIAL_APPROVAL_TEAM_NAME ||
      process.env.SLACK_DEFAULT_APPROVAL_TEAM_NAME ||
      "Design Haven Build",
    envFallbackEnabled: process.env.SLACK_SOCIAL_APPROVAL_ALLOW_ENV_FALLBACK === "true",
  });
}
