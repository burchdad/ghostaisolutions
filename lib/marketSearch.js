const DEFAULT_EXCLUDED_DOMAINS = new Set([
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
]);

export function normalizeDomain(value = "") {
  return String(value)
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .toLowerCase();
}

function normalizeResult(result = {}, defaults = {}) {
  const url = result.url || result.link || "";
  const domain = normalizeDomain(url || result.domain || "");
  if (!url && !domain) return null;
  return {
    title: result.title || result.name || domain,
    url: url || `https://${domain}`,
    domain,
    snippet: result.snippet || result.description || "",
    source: result.source || defaults.source || "market-search",
    query: result.query || defaults.query || "",
    position: result.position ?? defaults.position ?? null,
  };
}

function filterResults(results = [], { excludeDomains = [], includeDefaultExclusions = true } = {}) {
  const excluded = new Set([
    ...(includeDefaultExclusions ? DEFAULT_EXCLUDED_DOMAINS : []),
    ...excludeDomains.map(normalizeDomain),
  ]);
  const seen = new Set();
  return results
    .map((result) => normalizeResult(result))
    .filter((result) => {
      if (!result?.domain || excluded.has(result.domain) || seen.has(result.domain)) return false;
      seen.add(result.domain);
      return true;
    });
}

export function hasMarketSearchProvider() {
  return Boolean(process.env.SERPAPI_API_KEY || process.env.BRAVE_SEARCH_API_KEY || process.env.BING_SEARCH_API_KEY);
}

async function searchSerpApi(query, { limit = 10, location = "", engine = "google" } = {}) {
  const key = process.env.SERPAPI_API_KEY;
  if (!key) return [];
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", engine);
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", key);
  url.searchParams.set("num", String(Math.min(limit, 20)));
  if (location) url.searchParams.set("location", location);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.organic_results || []).map((r) =>
    normalizeResult({
      title: r.title,
      url: r.link,
      snippet: r.snippet,
      position: r.position,
      source: "serpapi",
      query,
    })
  ).filter(Boolean);
}

async function searchBrave(query, { limit = 10 } = {}) {
  const key = process.env.BRAVE_SEARCH_API_KEY;
  if (!key) return [];
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(Math.min(limit, 20)));
  const res = await fetch(url, {
    headers: { Accept: "application/json", "X-Subscription-Token": key },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.web?.results || []).map((r, index) =>
    normalizeResult({
      title: r.title,
      url: r.url,
      snippet: r.description,
      position: index + 1,
      source: "brave-search",
      query,
    })
  ).filter(Boolean);
}

async function searchBing(query, { limit = 10 } = {}) {
  const key = process.env.BING_SEARCH_API_KEY;
  if (!key) return [];
  const url = new URL("https://api.bing.microsoft.com/v7.0/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(Math.min(limit, 20)));
  const res = await fetch(url, {
    headers: { "Ocp-Apim-Subscription-Key": key },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.webPages?.value || []).map((r, index) =>
    normalizeResult({
      title: r.name,
      url: r.url,
      snippet: r.snippet,
      position: index + 1,
      source: "bing-search",
      query,
    })
  ).filter(Boolean);
}

export async function searchWeb(query, options = {}) {
  if (!String(query || "").trim()) return [];
  const limit = options.limit || 10;
  const providers = options.providers || ["serpapi", "brave", "bing"];
  const searches = providers.map((provider) => {
    if (provider === "serpapi") return searchSerpApi(query, { ...options, limit }).catch(() => []);
    if (provider === "brave") return searchBrave(query, { ...options, limit }).catch(() => []);
    if (provider === "bing") return searchBing(query, { ...options, limit }).catch(() => []);
    return Promise.resolve([]);
  });

  const batches = await Promise.all(searches);
  return filterResults(batches.flat(), options).slice(0, limit);
}

export async function searchMany(queries = [], options = {}) {
  const limitPerQuery = options.limitPerQuery || options.limit || 10;
  const batches = [];
  for (const query of queries.map((q) => String(q || "").trim()).filter(Boolean)) {
    batches.push(...await searchWeb(query, { ...options, limit: limitPerQuery }));
  }
  return filterResults(batches, options).slice(0, options.totalLimit || 50);
}

export async function searchCompany(nameOrDomain, options = {}) {
  const query = `${nameOrDomain} company website services about`;
  return searchWeb(query, { ...options, limit: options.limit || 8 });
}

export async function searchKeywords(topic, options = {}) {
  const query = `${topic} SEO keywords competitors questions`;
  return searchWeb(query, { ...options, limit: options.limit || 10 });
}

export async function searchLeads({ query, location = "", limit = 20 } = {}) {
  const scopedQuery = [query, location].filter(Boolean).join(" ");
  return searchWeb(scopedQuery, {
    limit,
    location,
    excludeDomains: ["ghostai.solutions", "g2.com", "capterra.com", "clutch.co"],
  });
}
