import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { scrapeBusinessWebsite } from "@/lib/leadIntelligence";
import { upsertLeadByDomain, upsertLeadByLinkedIn } from "@/lib/leadsStore";
import { configuredMarketSearchProviders, searchLeads, searchMany, searchWeb } from "@/lib/marketSearch";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

async function notifySlackHighValueLead(lead) {
  const webhook = process.env.SLACK_ALERTS_WEBHOOK;
  if (!webhook) return;
  try {
    const score = lead.score?.total ?? lead.aiOpportunity?.score ?? 0;
    const company = lead.company || lead.domain || "Unknown";
    const blocks = [
      { type: "header", text: { type: "plain_text", text: "🎯 High-Value Lead Discovered", emoji: true } },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Company:* ${company}` },
          { type: "mrkdwn", text: `*Score:* ${score}/100` },
          { type: "mrkdwn", text: `*Domain:* ${lead.domain || "N/A"}` },
          { type: "mrkdwn", text: `*Time:* ${new Date().toISOString()}` },
        ],
      },
      ...(lead.score?.reasons?.length
        ? [{ type: "section", text: { type: "mrkdwn", text: `*Signals:* ${lead.score.reasons.slice(0, 3).join("; ")}` } }]
        : []),
    ];
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });
  } catch (_) {
    // Best-effort
  }
}

function clean(value, max = 300) {
  return String(value || "").trim().slice(0, max);
}

function parseLinkedInCompanyTitle(title = "") {
  return String(title || "")
    .replace(/\s*\|\s*LinkedIn.*$/i, "")
    .replace(/\s*-\s*LinkedIn.*$/i, "")
    .replace(/\s+on LinkedIn.*$/i, "")
    .trim();
}

function campaignQueries({ channel, industry, location, niche }) {
  const market = clean(industry || niche || "local service businesses", 120);
  const place = clean(location || "", 120);
  const markets = market
    .split(/[,;/|]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
  const targets = markets.length ? markets : [market];

  if (channel === "linkedin") {
    return targets.flatMap((target) => [
      `site:linkedin.com/company ${target} ${place}`,
      `site:linkedin.com/company ${target} owner founder ${place}`,
    ]).map((item) => item.replace(/\s+/g, " ").trim()).slice(0, 10);
  }

  return targets.flatMap((target) => [
    `${target} ${place}`,
    `${target} near ${place}`,
    `${target} ${place} contact`,
  ]).map((item) => item.replace(/\s+/g, " ").trim()).slice(0, 12);
}

function parseUrlInputs(payload) {
  if (Array.isArray(payload?.urls)) {
    return payload.urls.map((u) => String(u || "").trim()).filter(Boolean);
  }

  const raw = String(payload?.urlInput || "");
  if (!raw.trim()) return [];
  return raw
    .split(/[\n,\s]+/)
    .map((u) => u.trim())
    .filter(Boolean);
}

async function resolveLeadUrls(body) {
  const urls = parseUrlInputs(body);
  if (urls.length) return { urls, searchResults: [] };

  const providers = configuredMarketSearchProviders();
  if (!providers.length) {
    throw Object.assign(new Error("Lead search is not configured"), {
      status: 503,
      details: "Set at least one production search provider env var: SERPAPI_API_KEY, BRAVE_SEARCH_API_KEY, or BING_SEARCH_API_KEY.",
    });
  }

  if (body?.campaign?.channel === "google") {
    const queries = campaignQueries({ ...body.campaign, channel: "google" });
    const searchResults = await searchMany(queries, {
      limitPerQuery: Math.max(2, Math.min(5, Number(body?.campaign?.limitPerQuery || Math.ceil(Number(body?.campaign?.limit || 25) / Math.max(1, queries.length))))),
      totalLimit: Math.max(5, Math.min(50, Number(body?.campaign?.limit || 25))),
      location: body.campaign.location || "",
      excludeLeadVendors: true,
      providers: ["serpapi", "brave", "bing"],
    });

    return {
      urls: searchResults.map((result) => result.url).filter(Boolean),
      searchResults,
    };
  }

  const query = String(body?.query || body?.searchQuery || "").trim();
  if (!query) return { urls: [], searchResults: [] };

  const searchResults = await searchLeads({
    query,
    location: body?.location || "",
    limit: Math.max(1, Math.min(25, Number(body?.limit || 15))),
  });

  return {
    urls: searchResults.map((result) => result.url).filter(Boolean),
    searchResults,
  };
}

async function discoverLinkedInCampaign(body) {
  const providers = configuredMarketSearchProviders();
  if (!providers.length) {
    throw Object.assign(new Error("Lead search is not configured"), {
      status: 503,
      details: "Set at least one production search provider env var: SERPAPI_API_KEY, BRAVE_SEARCH_API_KEY, or BING_SEARCH_API_KEY.",
    });
  }

  const campaign = body?.campaign || {};
  const queries = campaignQueries({ ...campaign, channel: "linkedin" });
  const searchResults = [];

  for (const query of queries) {
    const results = await searchWeb(query, {
      limit: Math.max(3, Math.min(10, Number(campaign.limitPerQuery || 6))),
      providers: ["serpapi", "brave", "bing"],
      includeDefaultExclusions: false,
      excludeDomains: ["ghostai.solutions"],
      excludeLeadVendors: true,
    });
    searchResults.push(...results.filter((result) => /linkedin\.com\/company/i.test(result.url)));
  }

  const seen = new Set();
  const limited = searchResults
    .filter((result) => {
      const key = String(result.url || "").split("?")[0].toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, Math.max(5, Math.min(50, Number(campaign.limit || 25))));

  const results = [];
  for (const result of limited) {
    const companyName = parseLinkedInCompanyTitle(result.title) || result.domain || "LinkedIn prospect";
    const lead = await upsertLeadByLinkedIn({
      companyName,
      domain: "",
      website: "",
      sourceType: "linkedin_search",
      sourceUrl: result.url,
      linkedinUrl: result.url,
      summary: result.snippet || `Discovered through LinkedIn campaign search: ${result.query}`,
      status: "new",
      notes: [
        `LinkedIn campaign result for ${campaign.industry || campaign.niche || "target market"}.`,
        campaign.location ? `Location focus: ${campaign.location}.` : "",
        "Outreach goal: invite them to the free website audit intake at /start.",
      ].filter(Boolean).join("\n"),
      signals: {
        services: [campaign.industry || campaign.niche || "linkedin prospect"].filter(Boolean),
        mentionsAI: false,
      },
      score: {
        fit: 55,
        urgency: 45,
        total: 51,
        reasons: ["LinkedIn company result found for targeted outreach campaign."],
      },
      aiOpportunity: {
        score: 58,
        reasons: ["LinkedIn prospect can be routed into website audit outreach."],
      },
    });

    results.push({ url: result.url, success: true, lead });
  }

  return {
    success: true,
    searched: limited.length,
    discovered: results.length,
    failed: 0,
    results,
  };
}

export async function POST(request) {
  if (!ensureAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    if (body?.campaign?.channel === "linkedin") {
      return NextResponse.json(await discoverLinkedInCampaign(body));
    }

    const { urls, searchResults } = await resolveLeadUrls(body);
    const limitedUrls = urls.slice(0, 25);

    if (!limitedUrls.length) {
      return NextResponse.json({ error: "No URLs or search results provided" }, { status: 400 });
    }

    const results = [];
    for (const url of limitedUrls) {
      const item = { url, success: false };
      try {
        const profile = await scrapeBusinessWebsite(url);
        const lead = await upsertLeadByDomain(profile);
        item.success = true;
        item.lead = lead;

        // Alert on high-value leads (score >= 75)
        const score = lead.score?.total ?? lead.aiOpportunity?.score ?? 0;
        if (score >= 75) {
          await notifySlackHighValueLead(lead);
        }
      } catch (error) {
        item.error = error?.message || String(error);
      }
      results.push(item);
    }

    return NextResponse.json({
      success: true,
      searched: searchResults.length,
      discovered: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Lead discovery failed", details: error?.details || error?.message || String(error) },
      { status: error?.status || 500 }
    );
  }
}
