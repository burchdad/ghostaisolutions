import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { listTrends, upsertTrends, pruneOldTrends, getTrendStats } from "@/lib/trendStore";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// ─── Source Fetchers ──────────────────────────────────────────────────────────

async function fetchHackerNewsTrending() {
  try {
    const res = await fetch("https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30");
    if (!res.ok) throw new Error(`HN ${res.status}`);
    const data = await res.json();
    return (data.hits ?? []).map((h) => ({
      title: h.title ?? "",
      url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
      source: "HackerNews",
      description: h.title ?? "",
      points: h.points || 0,
      comments: h.num_comments || 0,
    }));
  } catch { return []; }
}

async function fetchRedditAI() {
  try {
    const subreddits = ["artificial", "MachineLearning", "startups"];
    const results = [];
    for (const sub of subreddits) {
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=15`, {
        headers: { "User-Agent": "GhostAISolutions-TrendBot/1.0" },
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const item of data?.data?.children ?? []) {
        const p = item.data;
        if (!p.title || p.stickied) continue;
        results.push({
          title: p.title,
          url: p.url?.startsWith("http") ? p.url : `https://reddit.com${p.permalink}`,
          source: `Reddit r/${sub}`,
          description: (p.selftext || p.title).slice(0, 300),
          points: p.score || 0,
          comments: p.num_comments || 0,
        });
      }
    }
    return results;
  } catch { return []; }
}

async function fetchProductHunt() {
  try {
    // Product Hunt public GraphQL API (no key needed for basic access)
    const query = `{ posts(first: 15, order: VOTES) { edges { node { id name tagline url votesCount commentsCount topics { edges { node { name } } } } } } }`;
    const res = await fetch("https://api.producthunt.com/v2/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PRODUCT_HUNT_TOKEN || ""}`,
      },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error(`PH ${res.status}`);
    const data = await res.json();
    return (data?.data?.posts?.edges ?? []).map(({ node }) => ({
      title: node.name,
      url: node.url,
      source: "Product Hunt",
      description: node.tagline || "",
      points: node.votesCount || 0,
      comments: node.commentsCount || 0,
    }));
  } catch { return []; }
}

async function fetchDevTo() {
  try {
    const res = await fetch("https://dev.to/api/articles?state=rising&per_page=20&tags=ai,machinelearning,automation");
    if (!res.ok) throw new Error(`Dev.to ${res.status}`);
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((a) => ({
      title: a.title ?? "",
      url: a.url ?? "",
      source: "Dev.to",
      description: a.description || a.title || "",
      points: a.positive_reactions_count || 0,
      comments: a.comments_count || 0,
    }));
  } catch { return []; }
}

// ─── Relevance Scorer ─────────────────────────────────────────────────────────

const HIGH_KEYWORDS = ["ai agent", "llm", "automation", "gpt", "claude", "openai", "anthropic", "startup", "saas", "workflow", "copilot", "rag", "vector", "embeddings", "fine-tun"];
const MED_KEYWORDS  = ["machine learning", "devtools", "api", "no-code", "low-code", "productivity", "integration", "platform", "enterprise", "b2b", "sales", "marketing", "growth"];

function scoreRelevance(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  let score = 30;
  for (const kw of HIGH_KEYWORDS) if (text.includes(kw)) score += 12;
  for (const kw of MED_KEYWORDS) if (text.includes(kw)) score += 6;
  return Math.min(score, 100);
}

// ─── LLM Reactive Post Drafter ────────────────────────────────────────────────

async function draftReactivePost(trend) {
  if (!OPENAI_API_KEY) return { error: "OPENAI_API_KEY not configured" };

  const systemPrompt = `You are the social media voice for Ghost AI Solutions — a custom AI systems company that builds AI agents, workflow automation, and intelligent tooling for startups and growing businesses. Your tone is sharp, confident, informed, and occasionally witty. You never hype; you educate and position.`;

  const userPrompt = `A trend is gaining traction: "${trend.title}"
Source: ${trend.source}
Context: ${trend.description || ""}

Write 3 reactive social media posts about this trend, each for a different platform. Return JSON only with this structure:
{
  "linkedin": { "text": "...(150-300 words, professional insight, 2-3 hashtags)" },
  "x": { "text": "...(under 280 chars, punchy hook, 1-2 hashtags)" },
  "facebook": { "text": "...(60-120 words, community-oriented, conversational)" },
  "angle": "...(1 sentence: the unique perspective Ghost AI takes on this trend)"
}`;

  try {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
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

// ─── Route Handlers ───────────────────────────────────────────────────────────

export async function GET() {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stats = getTrendStats();
  const trends = listTrends().slice(0, 100);
  return NextResponse.json({ stats, trends });
}

export async function POST(request) {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const action = body.action || "refresh";

  if (action === "refresh") {
    // Fetch from all sources in parallel
    const [hn, reddit, ph, devto] = await Promise.all([
      fetchHackerNewsTrending(),
      fetchRedditAI(),
      fetchProductHunt(),
      fetchDevTo(),
    ]);

    const raw = [...hn, ...reddit, ...ph, ...devto];

    // Score and annotate each item
    const scored = raw.map((item) => ({
      ...item,
      relevanceScore: scoreRelevance(item.title, item.description),
    })).filter((item) => item.relevanceScore >= 40 && item.url);

    pruneOldTrends(7);
    const { added, updated } = upsertTrends(scored);
    const stats = getTrendStats();
    const trends = listTrends().slice(0, 100);

    return NextResponse.json({ success: true, added, updated, stats, trends });
  }

  if (action === "draft") {
    const { trendId } = body;
    const trend = listTrends().find((t) => t.id === trendId);
    if (!trend) return NextResponse.json({ error: "Trend not found" }, { status: 404 });

    const draft = await draftReactivePost(trend);
    return NextResponse.json({ success: true, draft, trend });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
