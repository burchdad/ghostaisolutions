import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { listSocialDrafts } from "@/lib/socialDraftStore";
import { createLead, listLeads, updateLead } from "@/lib/leadsStore";
import { withCronLogging } from "@/lib/cronRuns";

export const maxDuration = 60;

function getCronSecret() {
  return process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
}

function getXCredentials() {
  return {
    appKey: process.env.X_CONSUMER_KEY || process.env.X_API_KEY || "",
    appSecret: process.env.X_CONSUMER_SECRET || process.env.X_API_SECRET || "",
    accessToken: process.env.X_ACCESS_TOKEN || "",
    accessSecret: process.env.X_ACCESS_SECRET || process.env.X_ACCESS_TOKEN_SECRET || "",
  };
}

function getXClient() {
  const creds = getXCredentials();
  if (!creds.appKey || !creds.appSecret || !creds.accessToken || !creds.accessSecret) {
    return null;
  }
  return new TwitterApi(creds).readWrite;
}

function tweetUrl(tweetId) {
  return `https://twitter.com/i/web/status/${tweetId}`;
}

function profileUrl(username) {
  return username ? `https://x.com/${username}` : "";
}

function scoreEngagementLead(user, engagementType) {
  const description = `${user.description || ""} ${user.name || ""}`.toLowerCase();
  let total = engagementType === "reply" ? 68 : 58;
  const reasons = [`Engaged with Ghost AI Solutions social content via ${engagementType}.`];

  if (/founder|ceo|owner|operator|coo|revops|marketing|sales|agency|consultant/.test(description)) {
    total += 12;
    reasons.push("Profile language suggests business decision-maker or operator.");
  }

  if (/ai|automation|workflow|crm|growth|lead|sales|ops/.test(description)) {
    total += 10;
    reasons.push("Profile mentions AI, automation, growth, sales, or operations.");
  }

  total = Math.max(0, Math.min(100, total));
  return {
    fit: total,
    urgency: engagementType === "reply" ? 72 : 55,
    total,
    reasons,
  };
}

function buildLead({ user, tweetId, engagementType, draft }) {
  const score = scoreEngagementLead(user, engagementType);
  return {
    companyName: user.name || `X user @${user.username}`,
    domain: "",
    website: profileUrl(user.username),
    sourceType: "social-engagement",
    sourceUrl: tweetUrl(tweetId),
    ownerName: user.name || "",
    ownerRole: "",
    ownerEmail: "",
    contactEmail: "",
    linkedinUrl: "",
    summary: `${user.name || user.username} ${engagementType}ed with published social content: ${draft.title || draft.slug || tweetId}`,
    signals: {
      hasBlog: false,
      hasNewsletter: false,
      hasScheduling: false,
      hasChatWidget: false,
      mentionsAI: /ai|automation|workflow|agent/i.test(user.description || ""),
      services: ["social engagement"],
      techHints: ["x"],
    },
    score,
    aiOpportunity: {
      score: Math.min(100, score.total + 5),
      reasons: ["Warm social engagement creates a timely, relevant outreach angle."],
    },
    status: score.total >= 75 ? "qualified" : "new",
    notes: `X @${user.username || "unknown"} engaged via ${engagementType}. Draft: ${draft.id}. Post: ${tweetUrl(tweetId)}`,
  };
}

async function upsertEngagementLead(input) {
  const existing = (await listLeads()).find((lead) =>
    lead.sourceType === "social-engagement" &&
    lead.website &&
    input.website &&
    lead.website.toLowerCase() === input.website.toLowerCase()
  );

  if (!existing) {
    return createLead(input);
  }

  const notes = [existing.notes, input.notes].filter(Boolean).join("\n");
  return updateLead(existing.id, {
    ...existing,
    ...input,
    notes,
    status: existing.status === "new" ? input.status : existing.status,
  });
}

async function fetchLikedBy(client, tweetId, limit) {
  try {
    const response = await client.v2.tweetLikedBy(tweetId, {
      max_results: Math.max(10, Math.min(100, limit)),
      "user.fields": ["description", "url", "verified"],
    });
    return (response?.data?.data || []).map((user) => ({ user, engagementType: "like" }));
  } catch {
    return [];
  }
}

async function fetchReplies(client, tweetId, limit) {
  try {
    const paginator = await client.v2.search(`conversation_id:${tweetId} -is:retweet`, {
      max_results: Math.max(10, Math.min(100, limit)),
      expansions: ["author_id"],
      "user.fields": ["description", "url", "verified"],
    });
    const users = paginator?.includes?.users || [];
    return users.map((user) => ({ user, engagementType: "reply" }));
  } catch {
    return [];
  }
}

async function notifySlack({ created, updated }) {
  const webhook = process.env.SLACK_ALERTS_WEBHOOK;
  if (!webhook || created + updated === 0) return;
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blocks: [
        { type: "header", text: { type: "plain_text", text: "Social Engagement Leads Queued", emoji: true } },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Created:*\n${created}` },
            { type: "mrkdwn", text: `*Updated:*\n${updated}` },
          ],
        },
      ],
    }),
  });
}

async function handle(request) {
  const auth = request.headers.get("authorization") || "";
  const cronSecret = getCronSecret();
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = getXClient();
  if (!client) {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: "X API credentials are not configured",
    });
  }

  const draftLimit = Math.max(1, Math.min(20, Number(process.env.SOCIAL_ENGAGEMENT_DRAFT_LIMIT || 10)));
  const perPostLimit = Math.max(1, Math.min(50, Number(process.env.SOCIAL_ENGAGEMENT_PER_POST_LIMIT || 10)));
  const drafts = (await listSocialDrafts())
    .filter((draft) => draft.status === "published" && draft.publishResults?.x?.postId)
    .sort((a, b) => new Date(b.lastPublishedAt || b.updatedAt || 0) - new Date(a.lastPublishedAt || a.updatedAt || 0))
    .slice(0, draftLimit);

  let created = 0;
  let updated = 0;
  const checked = [];

  for (const draft of drafts) {
    const tweetId = draft.publishResults.x.postId;
    const engagements = [
      ...(await fetchReplies(client, tweetId, perPostLimit)),
      ...(await fetchLikedBy(client, tweetId, perPostLimit)),
    ];
    const seenUsers = new Set();

    for (const engagement of engagements) {
      const user = engagement.user;
      if (!user?.id || seenUsers.has(user.id)) continue;
      seenUsers.add(user.id);
      const before = await listLeads();
      const lead = await upsertEngagementLead(buildLead({ user, tweetId, engagementType: engagement.engagementType, draft }));
      const existed = before.some((item) => item.id === lead.id);
      if (existed) updated++;
      else created++;
    }

    checked.push({ draftId: draft.id, tweetId, engagements: seenUsers.size });
  }

  await notifySlack({ created, updated }).catch(() => null);

  return NextResponse.json({
    success: true,
    checkedPosts: checked.length,
    created,
    updated,
    checked,
    timestamp: new Date().toISOString(),
  });
}

export const GET = withCronLogging("social-engagement-leads", handle);
export const POST = withCronLogging("social-engagement-leads", handle);
