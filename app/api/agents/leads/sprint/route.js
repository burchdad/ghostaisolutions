import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { withCronLogging } from "@/lib/cronRuns";
import { generateOutreachDraft, scrapeBusinessWebsite, sendLeadEmail, toSimpleHtml } from "@/lib/leadIntelligence";
import { listLeads, updateLead, upsertLeadByDomain, upsertLeadByLinkedIn } from "@/lib/leadsStore";
import { configuredMarketSearchProviders, searchMany, searchWeb } from "@/lib/marketSearch";

export const maxDuration = 60;

function cronSecret() {
  return process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
}

function ensureAuthorized(request) {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  if (verifyAdminSessionToken(token)) return true;
  const expected = cronSecret();
  const auth = request.headers.get("authorization") || "";
  return Boolean(expected) && auth === `Bearer ${expected}`;
}

function clean(value, fallback = "") {
  return String(value || fallback).trim();
}

function sprintConfig(body = {}) {
  return {
    location: clean(body.location, process.env.LEAD_SPRINT_LOCATION || "Tyler TX"),
    industry: clean(body.industry, process.env.LEAD_SPRINT_INDUSTRY || "restaurants, HVAC, construction, detailing, salons"),
    intent: clean(body.intent, process.env.LEAD_SPRINT_INTENT || "outdated website online booking lead generation"),
    limit: Math.max(5, Math.min(50, Number(body.limit || process.env.LEAD_SPRINT_LIMIT || 25))),
    draftLimit: Math.max(1, Math.min(25, Number(body.draftLimit || process.env.LEAD_SPRINT_DRAFT_LIMIT || 10))),
    sendLimit: Math.max(0, Math.min(10, Number(body.sendLimit || process.env.LEAD_SPRINT_SEND_LIMIT || 3))),
    minScoreToDraft: Math.max(0, Math.min(100, Number(body.minScoreToDraft || process.env.LEAD_SPRINT_MIN_SCORE_TO_DRAFT || 45))),
    minScoreToSend: Math.max(0, Math.min(100, Number(body.minScoreToSend || process.env.LEAD_SPRINT_MIN_SCORE_TO_SEND || 65))),
    autoSend: Boolean(body.autoSend ?? (process.env.LEAD_SPRINT_AUTO_SEND === "true")),
  };
}

function targetMarkets(industry = "") {
  const markets = String(industry || "")
    .split(/[,;/|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return markets.length ? markets.slice(0, 6) : [clean(industry, "local service businesses")];
}

function googleQueries(cfg) {
  return targetMarkets(cfg.industry).flatMap((market) => [
    `${market} ${cfg.location}`,
    `${market} near ${cfg.location}`,
    `${market} ${cfg.location} contact`,
  ]).slice(0, 12);
}

function linkedinQueries(cfg) {
  return targetMarkets(cfg.industry).flatMap((market) => [
    `site:linkedin.com/company ${market} ${cfg.location}`,
    `site:linkedin.com/company ${market} owner founder ${cfg.location}`,
  ]).slice(0, 10);
}

function parseLinkedInCompanyTitle(title = "") {
  return String(title)
    .replace(/\s*\|\s*LinkedIn.*$/i, "")
    .replace(/\s*-\s*LinkedIn.*$/i, "")
    .replace(/\s+on LinkedIn.*$/i, "")
    .trim();
}

async function discoverGoogleLeads(cfg) {
  const queries = googleQueries(cfg);
  const searchResults = await searchMany(queries, {
    limitPerQuery: Math.max(2, Math.min(5, Math.ceil(cfg.limit / Math.max(1, queries.length)))),
    totalLimit: cfg.limit,
    location: cfg.location,
    excludeLeadVendors: true,
    providers: ["serpapi", "brave", "bing"],
  });

  const created = [];
  const failed = [];
  for (const result of searchResults.slice(0, cfg.limit)) {
    try {
      const profile = await scrapeBusinessWebsite(result.url);
      const lead = await upsertLeadByDomain({
        ...profile,
        sourceType: "lead_sprint_google",
        notes: [profile.notes, `Lead sprint: ${cfg.industry} / ${cfg.location}. Push to /start intake.`].filter(Boolean).join("\n"),
      });
      created.push(lead);
    } catch (error) {
      failed.push({ url: result.url, error: error?.message || String(error) });
    }
  }
  return { created, failed, searched: searchResults.length };
}

async function discoverLinkedInLeads(cfg) {
  const found = [];
  for (const query of linkedinQueries(cfg)) {
    const results = await searchWeb(query, {
      limit: Math.max(3, Math.min(8, Math.ceil(cfg.limit / 3))),
      providers: ["serpapi", "brave", "bing"],
      includeDefaultExclusions: false,
      excludeDomains: ["ghostai.solutions"],
      excludeLeadVendors: true,
    });
    found.push(...results.filter((result) => /linkedin\.com\/company/i.test(result.url)));
  }

  const seen = new Set();
  const created = [];
  for (const result of found) {
    const key = String(result.url || "").split("?")[0].toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    if (created.length >= cfg.limit) break;

    const companyName = parseLinkedInCompanyTitle(result.title) || "LinkedIn prospect";
    const lead = await upsertLeadByLinkedIn({
      companyName,
      domain: "",
      website: "",
      sourceType: "lead_sprint_linkedin",
      sourceUrl: result.url,
      linkedinUrl: result.url,
      summary: result.snippet || `Discovered by lead sprint LinkedIn search: ${result.query}`,
      status: "new",
      notes: `Lead sprint LinkedIn prospect for ${cfg.industry} / ${cfg.location}. Push to /start intake.`,
      signals: {
        services: [cfg.industry],
        mentionsAI: false,
      },
      score: {
        fit: 58,
        urgency: 50,
        total: 55,
        reasons: ["LinkedIn company result matched the active lead sprint target."],
      },
      aiOpportunity: {
        score: 62,
        reasons: ["LinkedIn prospect can be warmed with a website audit angle."],
      },
    });
    created.push(lead);
  }

  return { created, failed: [], searched: found.length };
}

function canDraft(lead, cfg) {
  const score = Number(lead.score?.total || 0);
  return score >= cfg.minScoreToDraft && !lead.emailDraft && lead.status !== "contacted" && lead.status !== "won";
}

function canSend(lead, cfg) {
  const score = Number(lead.score?.total || 0);
  const to = lead.ownerEmail || lead.contactEmail;
  return cfg.autoSend && to && lead.emailDraft?.subject && lead.emailDraft?.body && score >= cfg.minScoreToSend && lead.status !== "contacted";
}

async function draftAndMaybeSend(cfg) {
  const leads = await listLeads();
  const candidates = leads
    .filter((lead) => ["lead_sprint_google", "lead_sprint_linkedin", "scraped", "manual"].includes(lead.sourceType || ""))
    .sort((a, b) => Number(b.score?.total || 0) - Number(a.score?.total || 0));

  const drafted = [];
  const sent = [];
  const skipped = [];

  for (const lead of candidates) {
    if (drafted.length >= cfg.draftLimit) break;
    if (!canDraft(lead, cfg)) continue;
    try {
      const draft = await generateOutreachDraft(lead);
      const updated = await updateLead(lead.id, {
        emailDraft: draft,
        status: ["new", "qualified"].includes(lead.status) ? "ready_outreach" : lead.status,
      });
      drafted.push(updated);
    } catch (error) {
      skipped.push({ id: lead.id, companyName: lead.companyName, error: error?.message || String(error) });
    }
  }

  if (cfg.autoSend) {
    const refreshed = await listLeads();
    for (const lead of refreshed.sort((a, b) => Number(b.score?.total || 0) - Number(a.score?.total || 0))) {
      if (sent.length >= cfg.sendLimit) break;
      if (!canSend(lead, cfg)) continue;
      const to = lead.ownerEmail || lead.contactEmail;
      try {
        const result = await sendLeadEmail({
          to,
          subject: lead.emailDraft.subject,
          text: lead.emailDraft.body,
          html: toSimpleHtml(lead.emailDraft.body),
        });
        const sentAt = new Date().toISOString();
        const updated = await updateLead(lead.id, {
          status: "contacted",
          lastContactedAt: sentAt,
          emailEvents: [
            ...(Array.isArray(lead.emailEvents) ? lead.emailEvents : []),
            { type: "sent", provider: "resend", to, subject: lead.emailDraft.subject, at: sentAt, providerResponse: result },
          ],
        });
        sent.push(updated);
      } catch (error) {
        skipped.push({ id: lead.id, companyName: lead.companyName, error: error?.message || String(error) });
      }
    }
  }

  return { drafted, sent, skipped };
}

async function postSlackSummary(summary) {
  const botToken = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_LEAD_SPRINT_CHANNEL_ID || process.env.SLACK_INTAKE_CHANNEL_ID || process.env.SLACK_DEFAULT_CHANNEL_ID;
  const text = summary.warning
    ? `Lead sprint automation needs attention: ${summary.warning}`
    : `Lead sprint automation completed: ${summary.discovered} discovered, ${summary.drafted} drafted, ${summary.sent} sent.`;
  const blocks = [
    { type: "header", text: { type: "plain_text", text: "Lead Sprint Automation" } },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Target:*\n${summary.industry}` },
        { type: "mrkdwn", text: `*Location:*\n${summary.location}` },
        { type: "mrkdwn", text: `*Discovered:*\n${summary.discovered}` },
        { type: "mrkdwn", text: `*Drafted:*\n${summary.drafted}` },
        { type: "mrkdwn", text: `*Sent:*\n${summary.sent}` },
        { type: "mrkdwn", text: `*Auto-send:*\n${summary.autoSend ? "enabled" : "disabled"}` },
      ],
    },
    ...(summary.warning
      ? [{ type: "section", text: { type: "mrkdwn", text: `*Needs attention:*\n${summary.warning}` } }]
      : []),
  ];

  if (botToken && channel) {
    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { Authorization: `Bearer ${botToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ channel, text, blocks }),
    });
    return true;
  }

  const webhook = process.env.SLACK_ALERTS_WEBHOOK || process.env.SLACK_OPS_SUMMARY_WEBHOOK;
  if (!webhook) return false;
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, blocks }),
  });
  return true;
}

async function handle(request) {
  if (!ensureAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const cfg = sprintConfig(body);
  const dryRun = Boolean(body.dryRun);
  const providers = configuredMarketSearchProviders();

  if (dryRun) {
    return NextResponse.json({
      success: true,
      dryRun: true,
      config: cfg,
      searchProviders: providers,
      googleQueries: googleQueries(cfg),
      linkedinQueries: linkedinQueries(cfg),
    });
  }

  if (!providers.length) {
    return NextResponse.json(
      {
        error: "Lead sprint search is not configured",
        details: "Set at least one production search provider env var: SERPAPI_API_KEY, BRAVE_SEARCH_API_KEY, or BING_SEARCH_API_KEY.",
      },
      { status: 503 }
    );
  }

  const [google, linkedin] = await Promise.all([
    discoverGoogleLeads(cfg).catch((error) => ({ created: [], failed: [{ error: error?.message || String(error) }], searched: 0 })),
    discoverLinkedInLeads(cfg).catch((error) => ({ created: [], failed: [{ error: error?.message || String(error) }], searched: 0 })),
  ]);
  const outreach = await draftAndMaybeSend(cfg);
  const searched = google.searched + linkedin.searched;
  const discovered = google.created.length + linkedin.created.length;
  const failed = google.failed.length + linkedin.failed.length;
  const firstFailure = [...google.failed, ...linkedin.failed][0];
  const warning = searched === 0
    ? `No search results returned from configured provider(s): ${providers.join(", ")}. Check provider quota, key validity, and query/location targeting.`
    : discovered === 0 && failed > 0
      ? `Found ${searched} search result(s), but none could be turned into leads. First failure: ${firstFailure?.url ? `${firstFailure.url} - ` : ""}${firstFailure?.error || "unknown scrape failure"}`
      : "";

  const summary = {
    success: true,
    industry: cfg.industry,
    location: cfg.location,
    autoSend: cfg.autoSend,
    searchProviders: providers,
    searched,
    discovered,
    failed,
    drafted: outreach.drafted.length,
    sent: outreach.sent.length,
    skipped: outreach.skipped.length,
    warning,
    timestamp: new Date().toISOString(),
  };

  await postSlackSummary(summary).catch(() => null);

  return NextResponse.json({
    ...summary,
    google: { discovered: google.created.length, failed: google.failed },
    linkedin: { discovered: linkedin.created.length, failed: linkedin.failed },
    outreach: {
      drafted: outreach.drafted.map((lead) => ({ id: lead.id, companyName: lead.companyName, score: lead.score?.total || 0 })),
      sent: outreach.sent.map((lead) => ({ id: lead.id, companyName: lead.companyName })),
      skipped: outreach.skipped,
    },
  });
}

export const GET = withCronLogging("lead-sprint-automation", handle);
export const POST = withCronLogging("lead-sprint-automation", handle);
