import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/allPosts";
import { listSocialDrafts } from "@/lib/socialDraftStore";
import { listTrends, getTrendStats } from "@/lib/trendStore";
import { getCampaignStats, getSubscriberStats } from "@/lib/newsletterStore";
import { getCompetitorStats } from "@/lib/competitorStore";

function getCronSecret() {
  return process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
}

function now() {
  return new Date();
}

function monthWindow(date) {
  const end = new Date(date);
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1, 0, 0, 0));
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

function safePercent(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

function canonicalSiteUrl() {
  const raw = (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.ghostai.solutions").replace(/\/$/, "");
  if (raw === "https://ghostai.solutions") return "https://www.ghostai.solutions";
  return raw;
}

function aggregatePostMetrics(posts, start, end) {
  const monthPosts = posts.filter((p) => inRange(p.date, start, end));
  const autoPosts = monthPosts.filter((p) => p.auto);
  const withCover = monthPosts.filter((p) => Boolean(p.coverImage));
  const categoryCounts = {};

  for (const post of monthPosts) {
    const category = post.category || "uncategorized";
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  }

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return {
    totalPosts: monthPosts.length,
    autoPosts: autoPosts.length,
    manualPosts: monthPosts.length - autoPosts.length,
    postsWithCoverImage: withCover.length,
    coverImageRate: safePercent(withCover.length, monthPosts.length),
    topCategories,
    recentPostTitles: monthPosts.slice(0, 5).map((p) => p.title),
  };
}

function aggregateSocialMetrics(drafts, start, end) {
  const monthDrafts = drafts.filter((d) => inRange(d.updatedAt || d.createdAt, start, end));
  const statusCounts = {};
  const sourceTypeCounts = {};
  const platformPublishCounts = { linkedin: 0, x: 0, facebook: 0 };

  for (const draft of monthDrafts) {
    const status = draft.status || "unknown";
    statusCounts[status] = (statusCounts[status] || 0) + 1;

    const sourceType = draft.sourceType || "unknown";
    sourceTypeCounts[sourceType] = (sourceTypeCounts[sourceType] || 0) + 1;

    if (draft.publishResults?.linkedin?.success) platformPublishCounts.linkedin += 1;
    if (draft.publishResults?.x?.success) platformPublishCounts.x += 1;
    if (draft.publishResults?.facebook?.success) platformPublishCounts.facebook += 1;
  }

  return {
    draftsReviewed: monthDrafts.length,
    statusCounts,
    sourceTypeCounts,
    platformPublishCounts,
    publishedTotal: (statusCounts.published || 0) + (statusCounts.published_with_review_flags || 0),
    blockedTotal: (statusCounts.rejected || 0) + (statusCounts.blocked_by_moderator || 0),
  };
}

function aggregateTrendMetrics(trends, start, end) {
  const monthTrends = trends.filter((t) => inRange(t.fetchedAt, start, end));
  const highScore = monthTrends.filter((t) => (t.relevanceScore || 0) >= 70).length;
  return {
    trendsCaptured: monthTrends.length,
    highScoreTrends: highScore,
    highScoreRate: safePercent(highScore, monthTrends.length),
  };
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildReportHtml(report, siteUrl) {
  const categories = report.posts.topCategories.length
    ? report.posts.topCategories.map((c) => `<li>${escapeHtml(c.name)}: ${c.count}</li>`).join("")
    : "<li>None</li>";

  const recentPosts = report.posts.recentPostTitles.length
    ? report.posts.recentPostTitles.map((title) => `<li>${escapeHtml(title)}</li>`).join("")
    : "<li>No posts this month</li>";

  return `
  <div style="font-family:Arial,sans-serif;max-width:760px;margin:0 auto;color:#0f172a;padding:24px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
    <h1 style="margin:0 0 8px 0;">Ghost AI Solutions Monthly Ops Report</h1>
    <p style="margin:0 0 20px 0;color:#475569;">Period: ${escapeHtml(report.periodLabel)}</p>

    <h2>Content Engine</h2>
    <ul>
      <li>Total posts: ${report.posts.totalPosts}</li>
      <li>Auto-generated: ${report.posts.autoPosts}</li>
      <li>Manual: ${report.posts.manualPosts}</li>
      <li>Cover image rate: ${report.posts.coverImageRate}% (${report.posts.postsWithCoverImage}/${report.posts.totalPosts})</li>
    </ul>
    <p><strong>Top categories</strong></p>
    <ul>${categories}</ul>
    <p><strong>Recent titles</strong></p>
    <ul>${recentPosts}</ul>

    <h2>Social Distribution</h2>
    <ul>
      <li>Drafts processed: ${report.social.draftsReviewed}</li>
      <li>Published total: ${report.social.publishedTotal}</li>
      <li>Blocked total: ${report.social.blockedTotal}</li>
      <li>LinkedIn publishes: ${report.social.platformPublishCounts.linkedin}</li>
      <li>X publishes: ${report.social.platformPublishCounts.x}</li>
      <li>Facebook publishes: ${report.social.platformPublishCounts.facebook}</li>
    </ul>

    <h2>Trend Intelligence</h2>
    <ul>
      <li>Trends captured: ${report.trends.trendsCaptured}</li>
      <li>High score trends: ${report.trends.highScoreTrends}</li>
      <li>High score rate: ${report.trends.highScoreRate}%</li>
      <li>Current trend store size: ${report.trendStore.total}</li>
      <li>Undrafted trends currently: ${report.trendStore.undrafted}</li>
    </ul>

    <h2>Newsletter + Audience</h2>
    <ul>
      <li>Active subscribers: ${report.subscribers.active}</li>
      <li>Total subscribers: ${report.subscribers.total}</li>
      <li>Campaigns sent: ${report.campaigns.sent}</li>
      <li>Total newsletter sends: ${report.campaigns.totalSent}</li>
    </ul>

    <h2>Competitor Intelligence</h2>
    <ul>
      <li>Tracked competitors: ${report.competitors.total}</li>
      <li>Stored scans: ${report.competitors.scans}</li>
      <li>Last scan: ${escapeHtml(report.competitors.lastScan || "none")}</li>
    </ul>

    <p style="margin-top:22px;font-size:12px;color:#64748b;">Generated automatically by the Monthly Ops Reporter.<br/>Dashboard: <a href="${siteUrl}/admin/agents" style="color:#0f766e">${siteUrl}/admin/agents</a></p>
  </div>`;
}

async function sendReportEmail({ to, from, replyTo, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend send failed (${response.status}): ${text}`);
  }

  return response.json();
}

export async function POST(request) {
  const auth = request.headers.get("authorization") || "";
  const cronSecret = getCronSecret();
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const current = now();
    const { start, end } = monthWindow(current);
    const periodLabel = start.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

    const [allPosts, socialDrafts, trends, trendStore, campaignStats, subscriberStats, competitorStats] = await Promise.all([
      Promise.resolve(getAllPosts()),
      listSocialDrafts().catch(() => []),
      Promise.resolve(listTrends()),
      Promise.resolve(getTrendStats()),
      Promise.resolve(getCampaignStats()),
      Promise.resolve(getSubscriberStats()),
      Promise.resolve(getCompetitorStats()),
    ]);

    const report = {
      periodLabel,
      posts: aggregatePostMetrics(allPosts, start, end),
      social: aggregateSocialMetrics(socialDrafts, start, end),
      trends: aggregateTrendMetrics(trends, start, end),
      trendStore,
      campaigns: campaignStats,
      subscribers: subscriberStats,
      competitors: competitorStats,
    };

    const siteUrl = canonicalSiteUrl();
    const recipient = process.env.MONTHLY_REPORT_TO_EMAIL || process.env.RESEND_REPLY_TO || process.env.OUTREACH_REPLY_TO || process.env.OUTREACH_FROM_EMAIL;
    if (!recipient) {
      return NextResponse.json({ error: "Missing monthly report recipient (set MONTHLY_REPORT_TO_EMAIL or RESEND_REPLY_TO/OUTREACH_REPLY_TO)" }, { status: 500 });
    }

    const from = process.env.RESEND_FROM_EMAIL || "newsletter@ghostai.solutions";
    const replyTo = process.env.RESEND_REPLY_TO || process.env.OUTREACH_REPLY_TO || undefined;

    const emailResult = await sendReportEmail({
      to: recipient,
      from,
      replyTo,
      subject: `Monthly Ops Report — ${periodLabel}`,
      html: buildReportHtml(report, siteUrl),
    });

    return NextResponse.json({
      success: true,
      recipient,
      periodLabel,
      report,
      emailId: emailResult?.id || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Monthly report failed", details: error?.message || String(error) }, { status: 500 });
  }
}

export async function GET(request) {
  return POST(request);
}
