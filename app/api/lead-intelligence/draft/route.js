import { NextResponse } from "next/server";
import { generateOutreachDraft } from "@/lib/leadIntelligence";
import { getLead, updateLead } from "@/lib/leadsStore";
import { requireLeadIntelligenceServiceAuth } from "@/lib/leadIntelligenceServiceAuth";

export const runtime = "nodejs";

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
    const lead = body.leadId ? await getLead(String(body.leadId)) : body.lead;

    if (!lead) {
      return NextResponse.json({ error: "leadId or lead is required" }, { status: 400 });
    }

    const draft = await generateOutreachDraft(lead);
    let updatedLead = lead;

    if (body.persist !== false && body.leadId) {
      updatedLead = await updateLead(String(body.leadId), {
        emailDraft: draft,
        status: ["new", "qualified"].includes(lead.status) ? "ready_outreach" : lead.status,
      });
    }

    return NextResponse.json({ success: true, draft, lead: updatedLead });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate lead outreach draft", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

