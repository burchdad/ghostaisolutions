import crypto from "crypto";
import { listProviderConnectionsAsync } from "@/lib/tokenStore";

function canonicalSiteUrl() {
  const raw = (
    process.env.AUTOMATION_INTERNAL_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.ghostai.solutions"
  ).replace(/\/$/, "");
  if (raw === "https://ghostai.solutions") return "https://www.ghostai.solutions";
  return raw;
}

function approvalSecret() {
  return process.env.SLACK_APPROVAL_SECRET || process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
}

function hasSlackInteractivity() {
  return Boolean(process.env.SLACK_SIGNING_SECRET);
}

export function signSocialDraftAction({ draftId, action }) {
  const secret = approvalSecret();
  if (!secret) return "";
  return crypto
    .createHmac("sha256", secret)
    .update(`${draftId}:${action}`)
    .digest("hex");
}

export function verifySocialDraftAction({ draftId, action, token }) {
  const expected = signSocialDraftAction({ draftId, action });
  if (!expected || !token) return false;
  const left = Buffer.from(expected, "hex");
  const right = Buffer.from(String(token), "hex");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function actionUrl(draftId, action) {
  const token = signSocialDraftAction({ draftId, action });
  return `${canonicalSiteUrl()}/api/agents/social/approval/${encodeURIComponent(draftId)}?action=${encodeURIComponent(action)}&token=${token}`;
}

function actionButton({ text, action, style, draftId }) {
  const url = actionUrl(draftId, action);
  const button = {
    type: "button",
    text: { type: "plain_text", text, emoji: true },
    url,
    ...(style ? { style } : {}),
  };

  if (hasSlackInteractivity()) {
    return {
      ...button,
      action_id: `social_${action}`,
      value: JSON.stringify({ draftId, action }),
    };
  }

  return button;
}

function previewText(value = "", max = 650) {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  if (text.length <= max) return text || "No copy generated.";
  return `${text.slice(0, max - 1).trimEnd()}...`;
}

function variantPreviewBlocks(draft) {
  const variants = draft.platformVariants || {};
  return [
    ["LinkedIn", variants.linkedin?.text, 900],
    ["X", variants.x?.text, 280],
    ["Facebook", variants.facebook?.text, 700],
    ["Bluesky", variants.bluesky?.text, 300],
    ["Reddit", variants.reddit?.text, 900],
  ]
    .filter(([, text]) => text)
    .map(([label, text, max]) => ({
      type: "section",
      text: { type: "mrkdwn", text: `*${label}:*\n${previewText(text, max)}` },
    }));
}

function approvalTeamName() {
  return (
    process.env.SLACK_SOCIAL_APPROVAL_TEAM_NAME ||
    process.env.SLACK_DEFAULT_APPROVAL_TEAM_NAME ||
    "Design Haven Build"
  ).toLowerCase();
}

function configuredTeamMatch(connection) {
  const targetId = process.env.SLACK_SOCIAL_APPROVAL_TEAM_ID || "";
  const targetName = approvalTeamName();

  if (targetId && connection.teamId === targetId) return true;
  if (targetName && String(connection.teamName || "").toLowerCase() === targetName) return true;
  return false;
}

function approvalChannelId(connection) {
  return (
    process.env.SLACK_SOCIAL_APPROVAL_CHANNEL_ID ||
    connection?.incomingWebhook?.channel_id ||
    connection?.incomingWebhook?.channel ||
    ""
  );
}

function allowEnvFallback() {
  return process.env.SLACK_SOCIAL_APPROVAL_ALLOW_ENV_FALLBACK === "true";
}

export async function resolveSlackApprovalDestination() {
  const installedConnections = await listProviderConnectionsAsync("slack").catch(() => []);
  const matchedConnection = installedConnections.find((connection) => configuredTeamMatch(connection));

  if (matchedConnection?.incomingWebhook?.url) {
    return {
      type: "webhook",
      url: matchedConnection.incomingWebhook.url,
      source: "oauth",
      teamId: matchedConnection.teamId || "",
      teamName: matchedConnection.teamName || "",
      channel: matchedConnection.incomingWebhook.channel || matchedConnection.incomingWebhook.channel_name || "",
    };
  }

  if (matchedConnection?.accessToken && approvalChannelId(matchedConnection)) {
    return {
      type: "bot",
      token: matchedConnection.accessToken,
      channelId: approvalChannelId(matchedConnection),
      source: "oauth",
      teamId: matchedConnection.teamId || "",
      teamName: matchedConnection.teamName || "",
      channel: approvalChannelId(matchedConnection),
    };
  }

  if (allowEnvFallback()) {
    const envWebhook = process.env.SLACK_SOCIAL_APPROVAL_WEBHOOK || process.env.SLACK_ALERTS_WEBHOOK;
    if (envWebhook) {
      return { type: "webhook", url: envWebhook, source: "env", teamId: "", teamName: "", channel: "" };
    }
  }

  return null;
}

async function postSlackBlocks(destination, blocks) {
  if (destination?.type === "webhook" && destination.url) {
    const response = await fetch(destination.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });
    return response.ok;
  }

  if (destination?.type === "bot" && destination.token && destination.channelId) {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${destination.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ channel: destination.channelId, blocks }),
    });
    const data = await response.json().catch(() => null);
    return Boolean(response.ok && data?.ok);
  }

  return false;
}

export async function notifySlackSocialApproval({ draft, moderation = null, reason = "" }) {
  const destination = await resolveSlackApprovalDestination();
  if (!destination || !draft?.id) return false;

  const moderationText = moderation
    ? `Overall: ${moderation.status || "review"} | Approved: ${(moderation.approved || []).join(", ") || "none"} | Review: ${(moderation.review || []).join(", ") || "none"} | Blocked: ${(moderation.blocked || []).join(", ") || "none"}`
    : reason || "Review requested.";

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: "Social Draft Approval", emoji: true },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Title:*\n${draft.title || draft.slug || draft.id}` },
        { type: "mrkdwn", text: `*Status:*\n${draft.status || "review"}` },
        { type: "mrkdwn", text: `*Source:*\n${draft.sourceType || "automation"}` },
        { type: "mrkdwn", text: `*Draft ID:*\n\`${draft.id}\`` },
      ],
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: `*Moderation:*\n${moderationText}` },
    },
    ...variantPreviewBlocks(draft),
    {
      type: "actions",
      elements: [
        actionButton({ text: "Approve + Publish", action: "approve_publish", style: "primary", draftId: draft.id }),
        actionButton({ text: "Approve Only", action: "approve", draftId: draft.id }),
        actionButton({ text: "Reject", action: "reject", style: "danger", draftId: draft.id }),
      ],
    },
    {
      type: "context",
      elements: [{ type: "mrkdwn", text: `Created: ${draft.createdAt || new Date().toISOString()}` }],
    },
  ];

  return postSlackBlocks(destination, blocks);
}
