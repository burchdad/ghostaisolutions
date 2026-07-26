import crypto from "crypto";

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

export async function notifySlackSocialApproval({ draft, moderation = null, reason = "" }) {
  const webhook = process.env.SLACK_SOCIAL_APPROVAL_WEBHOOK || process.env.SLACK_ALERTS_WEBHOOK;
  if (!webhook || !draft?.id) return false;

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

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks }),
  });

  return response.ok;
}
