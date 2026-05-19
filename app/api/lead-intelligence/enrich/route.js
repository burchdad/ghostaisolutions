import { NextResponse } from "next/server";
import { generateOutreachDraft, getDomain, scrapeBusinessWebsite } from "@/lib/leadIntelligence";
import { upsertLeadByDomain, updateLead } from "@/lib/leadsStore";
import { requireLeadIntelligenceServiceAuth } from "@/lib/leadIntelligenceServiceAuth";

export const runtime = "nodejs";

function parseUrlInputs(payload) {
  if (Array.isArray(payload?.urls)) {
    return payload.urls.map((url) => String(url || "").trim()).filter(Boolean);
  }

  const raw = String(payload?.urlInput || payload?.query || "");
  if (!raw.trim()) return [];
  return raw.split(/[\n,\s]+/).map((url) => url.trim()).filter(Boolean);
}

function toCommandLead(lead) {
  return {
    id: lead.id,
    name: lead.ownerName || lead.contactEmail || "Unknown Contact",
    companyName: lead.companyName,
    title: lead.ownerRole || "Decision maker",
    email: lead.ownerEmail || lead.contactEmail || "",
    phone: "",
    niche: lead.signals?.services?.[0] || "General",
    location: "",
    source: "Ghost Lead Intelligence",
    score: lead.score?.total || lead.aiOpportunity?.score || 0,
    confidence: lead.contactEmail || lead.ownerEmail ? "contactable" : "needs enrichment",
    website: lead.website,
    domain: lead.domain,
    summary: lead.summary,
    status: lead.status,
    signals: lead.signals,
    aiOpportunity: lead.aiOpportunity,
    scoreBreakdown: lead.score,
    emailDraft: lead.emailDraft || null,
  };
}

export async function POST(request) {
  const auth = requireLeadIntelligenceServiceAuth(request);
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error, details: auth.details },
      { status: auth.status }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const persist = body.persist !== false;
    const draft = body.draft === true;
    const batchLimit = Math.max(
      1,
      Math.min(50, Number(body.limit || process.env.LEAD_INTELLIGENCE_BATCH_LIMIT || 25))
    );
    const urls = parseUrlInputs(body).slice(0, batchLimit);

    if (!urls.length) {
      return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
    }

    const results = [];

    for (const url of urls) {
      const item = { url, domain: getDomain(url), success: false };
      try {
        const profile = await scrapeBusinessWebsite(url);
        let lead = persist ? await upsertLeadByDomain(profile) : profile;

        if (draft) {
          const emailDraft = await generateOutreachDraft(lead);
          lead = persist && lead.id
            ? await updateLead(lead.id, { emailDraft, status: ["new", "qualified"].includes(lead.status) ? "ready_outreach" : lead.status })
            : { ...lead, emailDraft };
        }

        item.success = true;
        item.lead = lead;
        item.commandLead = toCommandLead(lead);
      } catch (error) {
        item.error = error?.message || String(error);
      }
      results.push(item);
    }

    const leads = results.filter((item) => item.success).map((item) => item.commandLead);

    return NextResponse.json({
      success: true,
      provider: "ghost-lead-intelligence",
      persisted: persist,
      drafted: draft,
      discovered: leads.length,
      failed: results.length - leads.length,
      total: leads.length,
      leads,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Lead intelligence enrichment failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

