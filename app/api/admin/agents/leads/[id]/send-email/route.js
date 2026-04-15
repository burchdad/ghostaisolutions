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
    try {
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
    } catch (persistError) {
      // Email has already been sent; do not report this as a hard failure.
      return NextResponse.json(
        {
          success: true,
          lead,
          send: result,
          warning: "Email sent but lead record update failed",
          warningDetails: persistError?.message || String(persistError),
        },
        { status: 200 }
      );
    }
  } catch (error) {
    const details = error?.message || String(error);
    const lower = details.toLowerCase();
    let hint = null;

    if (lower.includes("missing resend_api_key")) {
      hint = "Set RESEND_API_KEY in Vercel Project Environment Variables and redeploy.";
    } else if (lower.includes("verify") || lower.includes("domain") || lower.includes("sender")) {
      hint = "Verify the sending domain/address in Resend and ensure RESEND_FROM_EMAIL uses that verified sender.";
    } else if (lower.includes("forbidden") || lower.includes("unauthorized") || lower.includes("invalid api key")) {
      hint = "Check RESEND_API_KEY value and environment scope (Production/Preview/Development).";
    }

    return NextResponse.json(
      { error: "Failed to send outreach email", details, ...(hint ? { hint } : {}) },
      { status: 500 }
    );
  }
}
