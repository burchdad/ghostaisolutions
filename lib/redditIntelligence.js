const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const DEFAULT_SUBREDDITS = [
  "smallbusiness",
  "startups",
  "Entrepreneur",
  "SaaS",
  "ArtificialInteligence",
  "automation",
  "webdev",
  "NoCode",
];

const DEFAULT_KEYWORDS = [
  "ai agent",
  "ai automation",
  "workflow automation",
  "custom software",
  "crm",
  "lead intake",
  "missed calls",
  "automate",
  "openai",
  "chatbot",
  "voice agent",
  "website leads",
  "operations",
  "manual process",
];

const BUYER_INTENT_PHRASES = [
  "looking for",
  "recommend",
  "how do i",
  "what should i use",
  "need help",
  "anyone know",
  "best way",
  "tool for",
  "service for",
  "agency",
  "consultant",
  "build me",
  "hire",
  "replace",
  "integrate",
];

function splitEnvList(value = "", fallback = []) {
  const items = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : fallback;
}

function userAgent() {
  return process.env.REDDIT_USER_AGENT || "windows:ghostai.reddit-intelligence:v1.0 (by /u/ghostai)";
}

export function hasRedditIntelligenceConfig() {
  return Boolean(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET && process.env.REDDIT_REFRESH_TOKEN);
}

async function getRedditAccessToken() {
  const clientId = process.env.REDDIT_CLIENT_ID || "";
  const clientSecret = process.env.REDDIT_CLIENT_SECRET || "";
  const refreshToken = process.env.REDDIT_REFRESH_TOKEN || "";

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Reddit OAuth credentials");
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": userAgent(),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw new Error(data.message || `Reddit auth failed (${response.status})`);
  }

  return data.access_token;
}

async function redditJson(path, token, init = {}) {
  const response = await fetch(`https://oauth.reddit.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": userAgent(),
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Reddit API failed (${response.status})`);
  }
  return data;
}

function normalizePost(child, subreddit) {
  const post = child?.data || {};
  const permalink = post.permalink ? `https://www.reddit.com${post.permalink}` : "";
  return {
    postId: post.name || (post.id ? `t3_${post.id}` : ""),
    redditId: post.id || "",
    subreddit: post.subreddit || subreddit,
    title: post.title || "",
    selfText: post.selftext || "",
    author: post.author || "",
    score: post.score || 0,
    numComments: post.num_comments || 0,
    createdUtc: post.created_utc || null,
    sourceUrl: permalink,
    outboundUrl: post.url_overridden_by_dest || post.url || "",
  };
}

function scorePost(post, keywords) {
  const text = `${post.title} ${post.selfText}`.toLowerCase();
  const matchedKeywords = keywords.filter((keyword) => text.includes(keyword.toLowerCase()));
  const matchedIntent = BUYER_INTENT_PHRASES.filter((phrase) => text.includes(phrase));
  let score = matchedKeywords.length * 10 + matchedIntent.length * 12;

  if (/\?$/.test(post.title || "")) score += 10;
  if ((post.numComments || 0) <= 25) score += 8;
  if ((post.score || 0) >= 5) score += 5;
  if ((post.selfText || "").length >= 120) score += 8;
  if (/hire|agency|consultant|build|integrat|workflow|crm|lead|website/i.test(text)) score += 12;
  if (/free|coupon|promo|giveaway|meme/i.test(text)) score -= 20;

  return {
    intentScore: Math.max(0, Math.min(100, score)),
    matchedKeywords,
    matchedIntent,
  };
}

function makeFallbackReply(post) {
  return `A practical way to approach this is to map the workflow before picking tools:

1. What starts the process?
2. What data has to move between systems?
3. Where does a human need to approve or correct the output?
4. What should happen when the automation fails?

For small teams, the expensive mistake is usually buying one more SaaS tool before defining the handoff logic. If the process touches leads, CRM, email, calls, or reporting, a lightweight custom automation layer can be cleaner than stitching together five subscriptions.

I build systems like this at Ghost AI Solutions, so I am biased toward mapping the workflow first. Happy to sanity-check the process shape if you share the current stack.`;
}

async function draftReply(post, scoreData) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      reply: makeFallbackReply(post),
      tone: "helpful",
      mentionsGhostAI: true,
      estimatedImpact: scoreData.intentScore >= 75 ? "high" : "medium",
      notes: "Fallback reply generated without OpenAI.",
    };
  }

  const systemPrompt = `You are Stephen from Ghost AI Solutions.
Ghost AI Solutions builds custom AI agents, workflow automation, lead-intake systems, websites, CRM glue, and AI voice systems for growth-stage small businesses.

Write Reddit replies that are useful first. No spam, no hard selling, no fake humility.
Mention Ghost AI Solutions only when it naturally supports credibility.
Prefer practical workflow advice, questions, and implementation tradeoffs.`;

  const userPrompt = `Reddit thread:
Subreddit: r/${post.subreddit}
Title: ${post.title}
Body: ${String(post.selfText || "").slice(0, 2200)}
Matched keywords: ${scoreData.matchedKeywords.join(", ") || "none"}
Matched intent: ${scoreData.matchedIntent.join(", ") || "none"}

Draft a reply that:
- Is 90-180 words
- Gives specific next steps
- Does not sound promotional
- May mention Ghost AI Solutions once only if relevant
- Ends with a useful question or offer to clarify

Return only JSON:
{
  "reply": "string",
  "tone": "helpful|technical|operator",
  "mentionsGhostAI": true,
  "estimatedImpact": "high|medium|low",
  "notes": "why this is worth engaging"
}`;

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.62,
    }),
  });

  if (!response.ok) {
    return {
      reply: makeFallbackReply(post),
      tone: "helpful",
      mentionsGhostAI: true,
      estimatedImpact: scoreData.intentScore >= 75 ? "high" : "medium",
      notes: `OpenAI drafting failed (${response.status}); fallback used.`,
    };
  }

  const data = await response.json();
  return JSON.parse(data?.choices?.[0]?.message?.content || "{}");
}

export async function scanRedditIntelligence() {
  const token = await getRedditAccessToken();
  const subreddits = splitEnvList(process.env.REDDIT_TARGET_SUBREDDITS, DEFAULT_SUBREDDITS);
  const keywords = splitEnvList(process.env.REDDIT_BRAND_KEYWORDS, DEFAULT_KEYWORDS);
  const minScore = Math.max(20, Math.min(95, Number(process.env.REDDIT_INTENT_MIN_SCORE || 50)));
  const perSubreddit = Math.max(5, Math.min(50, Number(process.env.REDDIT_SCAN_LIMIT_PER_SUBREDDIT || 20)));
  const draftLimit = Math.max(1, Math.min(15, Number(process.env.REDDIT_DRAFT_LIMIT || 6)));
  const candidates = [];
  const seen = new Set();

  for (const subreddit of subreddits) {
    const data = await redditJson(`/r/${encodeURIComponent(subreddit)}/new?limit=${perSubreddit}`, token).catch(() => null);
    for (const child of data?.data?.children || []) {
      const post = normalizePost(child, subreddit);
      if (!post.postId || post.author === "[deleted]" || seen.has(post.postId)) continue;
      seen.add(post.postId);

      const scoreData = scorePost(post, keywords);
      if (scoreData.intentScore < minScore) continue;
      candidates.push({
        ...post,
        status: "drafted",
        platform: "Reddit",
        foundAt: new Date().toISOString(),
        intentScore: scoreData.intentScore,
        matchedKeywords: scoreData.matchedKeywords,
        matchedIntent: scoreData.matchedIntent,
        relevanceReason: scoreData.matchedIntent.length
          ? `Buyer-intent language: ${scoreData.matchedIntent.join(", ")}`
          : `Matched keywords: ${scoreData.matchedKeywords.join(", ")}`,
        scoreData,
        intelligence: {
          painPoint: scoreData.matchedKeywords.slice(0, 4).join(", ") || "AI/automation operations",
          suggestedContentAngle: `Answer Reddit demand around ${scoreData.matchedKeywords[0] || "AI automation"}`,
          brandFit: scoreData.intentScore >= 75 ? "strong" : "moderate",
        },
      });
    }
  }

  const opportunities = [];
  for (const candidate of candidates.sort((a, b) => b.intentScore - a.intentScore).slice(0, draftLimit)) {
    const draftReply = await draftReply(candidate, candidate.scoreData);
    const { scoreData, ...opportunity } = candidate;
    opportunities.push({ ...opportunity, draftReply });
  }

  return {
    success: true,
    scannedSubreddits: subreddits,
    keywords,
    opportunities,
    candidatesFound: candidates.length,
    timestamp: new Date().toISOString(),
  };
}

export async function postRedditComment({ thingId, text }) {
  if (!thingId || !text) throw new Error("Missing Reddit thing id or comment text");
  const token = await getRedditAccessToken();
  const data = await redditJson("/api/comment", token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      api_type: "json",
      thing_id: thingId,
      text,
    }),
  });

  const errors = data?.json?.errors || [];
  if (errors.length) {
    throw new Error(errors[0]?.[1] || "Reddit comment failed");
  }

  return {
    id: data?.json?.data?.things?.[0]?.data?.name || "",
    url: data?.json?.data?.things?.[0]?.data?.permalink
      ? `https://www.reddit.com${data.json.data.things[0].data.permalink}`
      : "",
    raw: data,
  };
}
