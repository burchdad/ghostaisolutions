import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { listOpportunities, upsertOpportunity, updateOpportunity, getEngagementStats, pruneOldOpportunities } from "@/lib/engagementStore";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// BRAND_KEYWORDS defines what Ghost AI monitors for across platforms
const BRAND_KEYWORDS = [
  "ghost ai", "ghostai", "ghost ai solutions",
  "custom ai agent", "build ai agent", "ai automation agency",
  "hire ai developer", "ai consulting", "ai systems integrator",
  "automate with ai", "ai workflow", "replace saas with ai",
  "openai custom", "llm integration", "ai for small business",
];

const COMPETITOR_HANDLES = (process.env.COMPETITOR_TWITTER_HANDLES || "").split(",").map((s) => s.trim()).filter(Boolean);

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

// ─── Social Listeners ─────────────────────────────────────────────────────────

async function searchRedditMentions() {
  const opportunities = [];
  const queries = ["ai agent startup", "custom ai workflow", "AI automation business", "ai consultant hire"];
  for (const q of queries) {
    try {
      const res = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=new&limit=15&t=week`, {
        headers: { "User-Agent": "GhostAISolutions-EngagementBot/1.0" },
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const item of data?.data?.children || []) {
        const p = item.data;
        if (!p.title || p.stickied || (p.score || 0) < 5) continue;
        const text = `${p.title} ${p.selftext || ""}`.toLowerCase();
        const isRelevant = BRAND_KEYWORDS.some((k) => text.includes(k.toLowerCase())) ||
          ["how do i", "looking for", "anyone know", "recommend", "best way to", "need help"].some((t) => text.includes(t));
        if (!isRelevant) continue;
        opportunities.push({
          platform: "Reddit",
          sourceUrl: `https://reddit.com${p.permalink}`,
          author: p.author || "",
          title: p.title,
          snippet: (p.selftext || p.title).slice(0, 280),
          score: p.score || 0,
          engagementType: "question_reply",
          relevanceReason: "Potential customer asking about AI automation",
        });
      }
    } catch { /* skip */ }
  }
  return opportunities;
}

async function searchHackerNewsMentions() {
  const opportunities = [];
  try {
    const res = await fetch("https://hn.algolia.com/api/v1/search?query=ai+agent+automation&tags=ask_hn,show_hn&hitsPerPage=20");
    if (!res.ok) return opportunities;
    const data = await res.json();
    for (const hit of data.hits || []) {
      if ((hit.points || 0) < 10) continue;
      opportunities.push({
        platform: "HackerNews",
        sourceUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`,
        author: hit.author || "",
        title: hit.title || "",
        snippet: (hit.story_text || hit.title || "").slice(0, 280),
        score: hit.points || 0,
        engagementType: "comment_opportunity",
        relevanceReason: "Ask HN / Show HN about AI automation",
      });
    }
  } catch { /* skip */ }
  return opportunities;
}

// ─── LLM Reply Drafter ────────────────────────────────────────────────────────

async function draftEngagementReply(opportunity) {
  if (!OPENAI_API_KEY) return { error: "OPENAI_API_KEY not configured" };

  const systemPrompt = `You are the founder of Ghost AI Solutions — a company that builds custom AI systems, agents, and workflow automation for startups and B2B operators. When engaging on social media or community forums, you provide genuinely helpful, concise answers. You're knowledgeable but never salesy. You mention Ghost AI only when directly relevant. You build authority by giving real value first.`;

  const userPrompt = `Someone posted this on ${opportunity.platform}:
Title: "${opportunity.title}"
Content: "${opportunity.snippet}"

Draft a helpful, authentic reply (100-200 words max). Be specific and practical. Only mention Ghost AI Solutions if it's a natural, non-forced fit. Write as the founder — use "I" not "we".

Return JSON only:
{
  "reply": "...(the reply text)",
  "tone": "helpful|expert|conversational",
  "mentionsGhostAI": true/false,
  "estimatedImpact": "high|medium|low",
  "notes": "...(1 sentence: why this is a good engagement opportunity)"
}`;

  try {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.72,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    return { error: e.message };
  }
}

// ─── Route Handlers ───────────────────────────────────────────────────────────

export async function GET() {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const opportunities = listOpportunities();
  const stats = getEngagementStats();
  return NextResponse.json({ opportunities, stats });
}

export async function POST(request) {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { action } = body;

  if (action === "scan") {
    pruneOldOpportunities(14);
    const [reddit, hn] = await Promise.all([searchRedditMentions(), searchHackerNewsMentions()]);
    const all = [...reddit, ...hn];
    let added = 0;
    for (const opp of all) {
      const result = upsertOpportunity(opp);
      if (result && result.status === "pending") added++;
    }
    const stats = getEngagementStats();
    const opportunities = listOpportunities();
    return NextResponse.json({ success: true, found: all.length, added, stats, opportunities });
  }

  if (action === "draft-reply") {
    const { opportunityId } = body;
    const opportunities = listOpportunities();
    const opp = opportunities.find((o) => o.id === opportunityId);
    if (!opp) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    const draft = await draftEngagementReply(opp);
    if (draft.error) return NextResponse.json({ error: draft.error }, { status: 500 });
    const updated = updateOpportunity(opportunityId, { status: "drafted", draftReply: draft });
    return NextResponse.json({ success: true, draft, opportunity: updated });
  }

  if (action === "update-status") {
    const { opportunityId, status } = body;
    const updated = updateOpportunity(opportunityId, { status, ...(status === "replied" ? { repliedAt: new Date().toISOString() } : {}) });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, opportunity: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
