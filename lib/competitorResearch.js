const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const MARKET_PROFILE =
  process.env.COMPETITOR_MARKET_PROFILE ||
  "Ghost AI Solutions builds custom AI automation systems, AI voice agents, data pipelines, workflow automation, and AI-enabled growth operations for B2B operators, COOs, RevOps teams, marketing teams, and founders.";

const DEFAULT_QUERIES = [
  "AI automation agency for B2B operations",
  "custom AI agents for business workflow automation",
  "AI voice agent agency for small business",
  "RevOps AI automation consulting",
  "AI workflow automation company",
  "custom GPT automation consultancy",
  "AI systems studio for B2B companies",
  "AI automation for marketing and sales operations",
];

const FALLBACK_COMPETITORS = [
  { name: "Relevance AI", domain: "relevanceai.com", notes: "AI agent workforce and automation platform" },
  { name: "Gumloop", domain: "gumloop.com", notes: "No-code AI workflow automation" },
  { name: "Stack AI", domain: "stack-ai.com", notes: "Enterprise AI workflow and agent builder" },
  { name: "n8n", domain: "n8n.io", notes: "Workflow automation with AI integrations" },
  { name: "Make", domain: "make.com", notes: "Visual automation platform for operations teams" },
  { name: "Zapier", domain: "zapier.com", notes: "Automation platform with AI agents and app integrations" },
];

const EXCLUDED_DOMAINS = new Set([
  "ghostai.solutions",
  "www.ghostai.solutions",
  "google.com",
  "bing.com",
  "linkedin.com",
  "facebook.com",
  "x.com",
  "twitter.com",
  "youtube.com",
  "reddit.com",
  "medium.com",
  "github.com",
  "crunchbase.com",
  "g2.com",
  "capterra.com",
]);

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeDomain(value = "") {
  return String(value)
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .toLowerCase();
}

function validCompetitor(item) {
  const domain = normalizeDomain(item?.domain || item?.url || "");
  const name = String(item?.name || item?.title || domain.split(".")[0] || "").trim();
  if (!name || !domain || !domain.includes(".") || EXCLUDED_DOMAINS.has(domain)) return null;
  return {
    name,
    domain,
    linkedinUrl: item.linkedinUrl || "",
    twitterHandle: item.twitterHandle || "",
    notes: item.notes || item.snippet || "Discovered from open market research",
    discoverySource: item.discoverySource || item.source || "market-research",
    discoveryQuery: item.discoveryQuery || "",
    lastDiscoveredAt: new Date().toISOString(),
  };
}

function parseConfiguredCompetitors() {
  const raw = process.env.COMPETITOR_SEEDS || process.env.COMPETITOR_MARKET_SEEDS || "";
  if (!raw.trim()) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(validCompetitor).filter(Boolean);
  } catch {
    // Fall through to compact parsing.
  }

  return raw
    .split(/[;\n]/)
    .map((entry) => {
      const [name, domain, notes = "Configured competitor seed"] = entry.split("|").map((part) => part?.trim());
      return validCompetitor({ name, domain, notes, source: "configured" });
    })
    .filter(Boolean);
}

function marketQueries() {
  const configured = (process.env.COMPETITOR_MARKET_QUERIES || "")
    .split(/[;\n]/)
    .map((q) => q.trim())
    .filter(Boolean);
  return configured.length ? configured : DEFAULT_QUERIES;
}

async function searchBrave(query) {
  const key = process.env.BRAVE_SEARCH_API_KEY;
  if (!key) return [];
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", "10");
  const res = await fetch(url, {
    headers: { Accept: "application/json", "X-Subscription-Token": key },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.web?.results || []).map((r) => ({
    name: r.title,
    url: r.url,
    snippet: r.description,
    source: "brave-search",
    discoveryQuery: query,
  }));
}

async function searchBing(query) {
  const key = process.env.BING_SEARCH_API_KEY;
  if (!key) return [];
  const url = new URL("https://api.bing.microsoft.com/v7.0/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", "10");
  const res = await fetch(url, {
    headers: { "Ocp-Apim-Subscription-Key": key },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.webPages?.value || []).map((r) => ({
    name: r.name,
    url: r.url,
    snippet: r.snippet,
    source: "bing-search",
    discoveryQuery: query,
  }));
}

async function searchSerpApi(query) {
  const key = process.env.SERPAPI_API_KEY;
  if (!key) return [];
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", key);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.organic_results || []).map((r) => ({
    name: r.title,
    url: r.link,
    snippet: r.snippet,
    source: "serpapi",
    discoveryQuery: query,
  }));
}

async function discoverWithSearchProviders() {
  const queries = marketQueries();
  const batches = [];
  for (const query of queries) {
    const [brave, bing, serp] = await Promise.all([
      searchBrave(query).catch(() => []),
      searchBing(query).catch(() => []),
      searchSerpApi(query).catch(() => []),
    ]);
    batches.push(...brave, ...bing, ...serp);
  }
  return batches.map(validCompetitor).filter(Boolean);
}

async function discoverWithOpenAI() {
  if (!OPENAI_API_KEY) return FALLBACK_COMPETITORS.map((item) => validCompetitor({ ...item, source: "fallback" })).filter(Boolean);

  try {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a competitive market researcher. Identify real companies with public websites that compete directly or adjacently with the user's business. Return only valid JSON.",
          },
          {
            role: "user",
            content: `Business profile: ${MARKET_PROFILE}\n\nFind 12 competitor websites across direct AI automation consultancies, AI agent platforms, workflow automation platforms, and AI voice agent providers. Return JSON: {"competitors":[{"name":"...","domain":"example.com","notes":"why they matter"}]}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || "{}");
    const competitors = (parsed.competitors || []).map((item) => validCompetitor({ ...item, source: "openai-market-research" })).filter(Boolean);
    return competitors.length ? competitors : FALLBACK_COMPETITORS.map((item) => validCompetitor({ ...item, source: "fallback" })).filter(Boolean);
  } catch {
    return FALLBACK_COMPETITORS.map((item) => validCompetitor({ ...item, source: "fallback" })).filter(Boolean);
  }
}

async function rankCompetitors(candidates) {
  const unique = uniqueBy(candidates, (item) => item.domain).slice(0, 40);
  if (!OPENAI_API_KEY || unique.length <= 12) return unique.slice(0, 20);

  try {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "Rank competitor candidates by relevance to Ghost AI Solutions. Return only JSON." },
          {
            role: "user",
            content: `Business profile: ${MARKET_PROFILE}\n\nCandidates:\n${JSON.stringify(unique)}\n\nReturn JSON: {"domains":["domain1.com","domain2.com"]} with the best 20 direct or adjacent competitors.`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });
    if (!res.ok) return unique.slice(0, 20);
    const data = await res.json();
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || "{}");
    const order = Array.isArray(parsed.domains) ? parsed.domains.map(normalizeDomain) : [];
    const byDomain = new Map(unique.map((item) => [item.domain, item]));
    const ranked = order.map((domain) => byDomain.get(domain)).filter(Boolean);
    return uniqueBy([...ranked, ...unique], (item) => item.domain).slice(0, 20);
  } catch {
    return unique.slice(0, 20);
  }
}

export async function discoverCompetitorWebsites() {
  const configured = parseConfiguredCompetitors();
  const searched = await discoverWithSearchProviders();
  const openai = searched.length ? [] : await discoverWithOpenAI();
  const ranked = await rankCompetitors([...configured, ...searched, ...openai]);

  return {
    competitors: ranked,
    sources: [...new Set(ranked.map((item) => item.discoverySource).filter(Boolean))],
    usedSearchProvider: searched.length > 0,
    queryCount: marketQueries().length,
  };
}

function stripHtml(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(html = "") {
  const title = (/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html) || [])[1]?.trim() || "";
  const description =
    (/meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i.exec(html) || [])[1]?.trim() ||
    (/meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["']/i.exec(html) || [])[1]?.trim() ||
    "";
  return { title, description };
}

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "GhostAISolutions-CompBot/1.0 (+https://ghostai.solutions)" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const html = await res.text();
    const meta = extractMeta(html);
    return { url, html, meta, text: stripHtml(html).slice(0, 3000) };
  } catch {
    return null;
  }
}

async function collectWebsiteSignals(competitor) {
  const base = `https://${competitor.domain}`;
  const paths = ["", "/about", "/services", "/solutions", "/pricing", "/case-studies", "/blog"];
  const pages = (await Promise.all(paths.map((p) => fetchPage(`${base}${p}`)))).filter(Boolean);

  const rssUrls = [`${base}/feed`, `${base}/feed/`, `${base}/rss`, `${base}/blog/feed`];
  const recentPosts = [];
  for (const rssUrl of rssUrls) {
    try {
      const res = await fetch(rssUrl, { headers: { "User-Agent": "GhostAISolutions-CompBot/1.0" }, signal: AbortSignal.timeout(5000), cache: "no-store" });
      if (!res.ok) continue;
      const xml = await res.text();
      for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
        const block = match[1];
        const title = (/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i.exec(block) || [])[1]?.trim();
        const link = (/<link>(https?:\/\/[^<]+)<\/link>/i.exec(block) || [])[1]?.trim();
        if (title && link) recentPosts.push({ title, url: link });
      }
      if (recentPosts.length) break;
    } catch {
      // skip feed failures
    }
  }

  return {
    homepage: pages[0]?.meta || {},
    pages: pages.map((p) => ({ url: p.url, title: p.meta.title, description: p.meta.description, text: p.text })),
    recentPosts: recentPosts.slice(0, 5),
  };
}

function heuristicAnalysis(competitor, signals) {
  return {
    positioningSummary: `${competitor.name} appears to compete around ${signals.homepage?.description || "AI and workflow automation"}.`,
    contentFocus: signals.recentPosts.map((p) => p.title).join("; ") || "No recent content feed detected.",
    apparentStrengths: ["Established public web presence", "Clear enough category signal to monitor"],
    apparentWeaknesses: ["Limited automated evidence without OpenAI analysis"],
    differentiationOpportunity: "Ghost AI Solutions can stand apart by showing concrete operational outcomes, implementation speed, and custom systems depth.",
    actionableInsight: "Publish a comparison-style asset that emphasizes custom AI automation outcomes over generic platform claims.",
    threatLevel: "medium",
    ghostAdvantagePlays: ["Lead with ROI-backed systems case studies", "Show live automation demos", "Package voice agents plus workflow integration"],
  };
}

async function analyzeSignals(competitor, signals) {
  if (!OPENAI_API_KEY) return heuristicAnalysis(competitor, signals);

  try {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a competitive intelligence strategist for Ghost AI Solutions. Analyze competitor websites and recommend how Ghost AI Solutions can become a more advanced competitor. Return only JSON.",
          },
          {
            role: "user",
            content: `Ghost AI profile: ${MARKET_PROFILE}\n\nCompetitor: ${competitor.name} (${competitor.domain})\nSignals:\n${JSON.stringify(signals).slice(0, 12000)}\n\nReturn JSON: {"positioningSummary":"...","contentFocus":"...","offerSummary":"...","apparentStrengths":["..."],"apparentWeaknesses":["..."],"differentiationOpportunity":"...","ghostAdvantagePlays":["..."],"websiteMessagingRecommendations":["..."],"contentIdeas":["..."],"salesEnablementAngles":["..."],"actionableInsight":"...","threatLevel":"low|medium|high"}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.35,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    return JSON.parse(data?.choices?.[0]?.message?.content || "{}");
  } catch {
    return heuristicAnalysis(competitor, signals);
  }
}

export async function scanCompetitorWebsite(competitor) {
  const signals = await collectWebsiteSignals(competitor);
  const analysis = await analyzeSignals(competitor, signals);
  return {
    competitorId: competitor.id,
    competitorName: competitor.name,
    domain: competitor.domain,
    signals,
    analysis,
  };
}
