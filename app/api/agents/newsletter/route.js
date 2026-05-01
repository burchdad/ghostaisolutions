import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import {
  listSubscribers, upsertSubscriber, getSubscriberStats,
  listCampaigns, createCampaign, updateCampaign, getCampaign, getCampaignStats,
} from "@/lib/newsletterStore";
import { getAllPosts } from "@/lib/allPosts";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

// ─── LLM Helpers ─────────────────────────────────────────────────────────────

async function generateWeeklyDigest(posts, trendTitles = []) {
  if (!OPENAI_API_KEY) return { error: "OPENAI_API_KEY not configured" };

  const postSummaries = posts
    .slice(0, 5)
    .map((p, i) => `${i + 1}. "${p.title}" — ${p.excerpt || ""}`)
    .join("\n");

  const trendsSnippet = trendTitles.length
    ? `\nThis week's AI trends: ${trendTitles.slice(0, 4).join("; ")}`
    : "";

  const systemPrompt = `You are the newsletter editor for Ghost AI Solutions — a boutique AI systems studio that builds custom automation platforms, AI voice agents, and data pipelines for startups and growth-stage B2B companies. Your newsletter readers are operators, founders, and RevOps leads who want practical AI insights without the fluff.`;

  const userPrompt = `Write a weekly newsletter digest email. Recent blog posts to feature:\n${postSummaries}${trendsSnippet}

Return JSON only:
{
  "subject": "...(email subject line, under 60 chars, no clickbait)",
  "previewText": "...(email preview/preheader, under 90 chars)",
  "headline": "...(main newsletter headline)",
  "intro": "...(2-3 sentence opening from the founder, casual and direct)",
  "sections": [
    {
      "title": "...",
      "body": "...(2-3 sentences summarizing why this matters)",
      "ctaText": "Read more",
      "ctaUrl": "/blog/[slug]"
    }
  ],
  "closingNote": "...(brief sign-off, 1-2 sentences, authentic)",
  "ps": "...(optional P.S. — a tip, question, or soft CTA)"
}`;

  try {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.75,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    return { error: e.message };
  }
}

async function generateDripSequence(context = "general AI automation") {
  if (!OPENAI_API_KEY) return { error: "OPENAI_API_KEY not configured" };

  const systemPrompt = `You are the email strategist for Ghost AI Solutions. Write nurture email sequences that educate, build trust, and gently move prospects toward booking a discovery call. Never spam. Always lead with value.`;

  const userPrompt = `Write a 5-email welcome/nurture drip sequence for new newsletter subscribers interested in: "${context}".

Return JSON only:
{
  "name": "...(sequence name)",
  "emails": [
    {
      "day": 0,
      "subject": "...",
      "previewText": "...",
      "body": "...(plain text, 100-200 words, personal and direct)",
      "goal": "...(one-word: welcome|educate|proof|offer|followup)"
    }
  ]
}
Write 5 emails for days: 0, 2, 5, 10, 21.`;

  try {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.78,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    return { error: e.message };
  }
}

// ─── Send via Resend ──────────────────────────────────────────────────────────

async function sendCampaign(campaign, subscribers) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Ghost AI Solutions <newsletter@ghostai.solutions>";
  if (!apiKey) return { error: "RESEND_API_KEY not configured" };

  const active = subscribers.filter((s) => s.status === "active");
  const results = [];
  let sent = 0;

  for (const sub of active) {
    try {
      const html = buildEmailHtml(campaign, sub);
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [sub.email], subject: campaign.subject, html }),
      });
      sent++;
      results.push({ email: sub.email, ok: true });
    } catch (e) {
      results.push({ email: sub.email, ok: false, error: e.message });
    }
  }

  return { sent, failed: active.length - sent, results };
}

function buildEmailHtml(campaign, sub) {
  const firstName = sub.name?.split(" ")[0] || "there";
  const sections = (campaign.content?.sections || [])
    .map((s) => `<div style="margin-bottom:24px"><h3 style="color:#0e7490;margin:0 0 8px">${s.title}</h3><p style="margin:0 0 10px;line-height:1.6">${s.body}</p><a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://ghostai.solutions"}${s.ctaUrl || ""}" style="color:#06b6d4;font-weight:600">${s.ctaText || "Read more"} →</a></div>`)
    .join("");

  return `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f172a;color:#e2e8f0;max-width:600px;margin:0 auto;padding:32px 24px">
<h1 style="color:#ffffff;font-size:24px;margin:0 0 8px">${campaign.content?.headline || campaign.subject}</h1>
<p style="color:#94a3b8;font-size:13px;margin:0 0 24px">Hey ${firstName}, ${campaign.content?.intro || ""}</p>
${sections}
<p style="color:#94a3b8;font-size:13px;margin:24px 0 0">${campaign.content?.closingNote || "—"}<br><br>Ghost AI Solutions</p>
${campaign.content?.ps ? `<p style="color:#64748b;font-size:12px;margin:16px 0 0"><em>P.S. ${campaign.content.ps}</em></p>` : ""}
<hr style="border:none;border-top:1px solid #1e293b;margin:24px 0">
<p style="color:#475569;font-size:11px;text-align:center"><a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://ghostai.solutions"}/unsubscribe?email=${encodeURIComponent(sub.email)}" style="color:#475569">Unsubscribe</a></p>
</body></html>`;
}

// ─── Route Handlers ───────────────────────────────────────────────────────────

export async function GET() {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscribers = listSubscribers();
  const campaigns = listCampaigns();
  const subStats = getSubscriberStats();
  const campStats = getCampaignStats();
  const recentPosts = getAllPosts().slice(0, 5).map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt || "" }));

  return NextResponse.json({ subscribers, campaigns, subStats, campStats, recentPosts });
}

export async function POST(request) {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { action } = body;

  if (action === "add-subscriber") {
    const { email, name, source, tags } = body;
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
    const result = upsertSubscriber({ email, name, source: source || "manual", tags: tags || [] });
    return NextResponse.json(result);
  }

  if (action === "generate-digest") {
    const posts = getAllPosts().slice(0, 5);
    const digest = await generateWeeklyDigest(posts, body.trendTitles || []);
    if (digest.error) return NextResponse.json({ error: digest.error }, { status: 500 });
    const campaign = createCampaign({
      subject: digest.subject,
      previewText: digest.previewText,
      type: "weekly-digest",
      content: digest,
    });
    return NextResponse.json({ success: true, campaign });
  }

  if (action === "generate-drip") {
    const sequence = await generateDripSequence(body.context || "general AI automation");
    if (sequence.error) return NextResponse.json({ error: sequence.error }, { status: 500 });
    return NextResponse.json({ success: true, sequence });
  }

  if (action === "send-campaign") {
    const { campaignId } = body;
    const campaign = getCampaign(campaignId);
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    const subscribers = listSubscribers();
    const result = await sendCampaign(campaign, subscribers);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
    updateCampaign(campaignId, { status: "sent", sentAt: new Date().toISOString(), sentCount: result.sent });
    return NextResponse.json({ success: true, ...result });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
