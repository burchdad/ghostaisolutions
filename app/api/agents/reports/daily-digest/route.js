import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/allPosts";
import { listSocialDrafts } from "@/lib/socialDraftStore";
import { getTrendStats } from "@/lib/trendStore";
import { getSubscriberStats, getCampaignStats } from "@/lib/newsletterStore";

function getCronSecret() {
  return process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
}

function todayWindow() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));
  return { start, end };
}

function parseDate(value) {
  const parsed = new Date(value || "");
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function inRange(value, start, end) {
  const d = parseDate(value);
  if (!d) return false;
  return d >= start && d <= end;
}

async function postToSlack(webhookUrl, blocks) {
  if (!webhookUrl) return;
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks }),
  });
}

export async function POST(request) {
  const auth = request.headers.get("authorization") || "";
  const cronSecret = getCronSecret();
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { start, end } = todayWindow();
    const dateLabel = start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });

    const [allPosts, drafts, trendStats, subscriberStats, campaignStats] = await Promise.all([
      Promise.resolve(getAllPosts()),
      listSocialDrafts().catch(() => []),
      Promise.resolve(getTrendStats()),
      Promise.resolve(getSubscriberStats()),
      Promise.resolve(getCampaignStats()),
    ]);

    // Today's blog posts
    const todayPosts = allPosts.filter((p) => inRange(p.date, start, end));
    const autoPostsToday = todayPosts.filter((p) => p.auto).length;

    // Today's social activity
    const todayDrafts = drafts.filter((d) => inRange(d.updatedAt || d.createdAt, start, end));
    const published = todayDrafts.filter((d) => d.status === "published" || d.status === "published_with_review_flags").length;
    const blocked = todayDrafts.filter((d) => d.status === "rejected").length;

    const digest = {
      date: dateLabel,
      posts: { total: todayPosts.length, auto: autoPostsToday },
      social: { processed: todayDrafts.length, published, blocked },
      trends: { total: trendStats.total || 0, high: trendStats.high || 0 },
      subscribers: { active: subscriberStats.active || 0 },
      campaigns: { sent: campaignStats.sent || 0, totalSent: campaignStats.totalSent || 0 },
    };

    // Build Slack Block Kit message
    const blocks = [
      {
        type: "header",
        text: { type: "plain_text", text: `📊 Daily Ops Digest — ${dateLabel}`, emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Blog Posts Today:*\n${todayPosts.length} total (${autoPostsToday} auto-generated)` },
          { type: "mrkdwn", text: `*Social:*\n${published} published, ${blocked} blocked` },
          { type: "mrkdwn", text: `*Trend Store:*\n${digest.trends.total} signals, ${digest.trends.high} high-score` },
          { type: "mrkdwn", text: `*Subscribers:*\n${digest.subscribers.active} active` },
        ],
      },
      { type: "divider" },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Campaigns sent all-time: ${campaignStats.totalSent || 0} | Generated: ${new Date().toISOString()}`,
          },
        ],
      },
    ];

    const webhookUrl = process.env.SLACK_OPS_SUMMARY_WEBHOOK;
    if (webhookUrl) {
      await postToSlack(webhookUrl, blocks);
    }

    return NextResponse.json({
      success: true,
      date: dateLabel,
      digest,
      slackPosted: Boolean(webhookUrl),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Daily digest failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return POST(request);
}
