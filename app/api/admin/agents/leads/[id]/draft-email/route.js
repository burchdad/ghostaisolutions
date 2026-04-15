import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { generateOutreachDraft } from "@/lib/leadIntelligence";
import { getLead, updateLead } from "@/lib/leadsStore";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

export async function POST(_request, { params }) {
  if (!ensureAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const lead = await getLead(params.id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const draft = await generateOutreachDraft(lead);
    const updated = await updateLead(params.id, {
      emailDraft: draft,
      status: ["new", "qualified"].includes(lead.status) ? "ready_outreach" : lead.status,
    });

    return NextResponse.json({ success: true, lead: updated, draft });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate outreach draft", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
