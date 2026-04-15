import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { sendLeadEmail, toSimpleHtml } from "@/lib/leadIntelligence";
import { getLead, updateLead } from "@/lib/leadsStore";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

export async function POST(request, { params }) {
  if (!ensureAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const lead = await getLead(params.id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const to = body.to || lead.ownerEmail || lead.contactEmail;
    if (!to) {
      return NextResponse.json({ error: "No recipient email on lead" }, { status: 400 });
    }

    const subject = body.subject || lead.emailDraft?.subject;
    const message = body.body || lead.emailDraft?.body;
    if (!subject || !message) {
      return NextResponse.json({ error: "Missing subject/body; generate or provide an email draft first" }, { status: 400 });
    }

    const result = await sendLeadEmail({
      to,
      subject,
      text: message,
      html: toSimpleHtml(message),
    });

    const sentAt = new Date().toISOString();
    const updated = await updateLead(params.id, {
      status: "contacted",
      lastContactedAt: sentAt,
      emailEvents: [
        ...(Array.isArray(lead.emailEvents) ? lead.emailEvents : []),
        {
          type: "sent",
          provider: "resend",
          to,
          subject,
          at: sentAt,
          providerResponse: result,
        },
      ],
    });

    return NextResponse.json({ success: true, lead: updated, send: result });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send outreach email", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
