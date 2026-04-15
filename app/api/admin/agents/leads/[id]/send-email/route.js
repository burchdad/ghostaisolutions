import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { sendLeadEmail, toSimpleHtml } from "@/lib/leadIntelligence";
import { getLead, listLeads, updateLead } from "@/lib/leadsStore";

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

    const now = new Date();
    const cooldownHours = Math.max(1, Number(process.env.LEADS_OUTREACH_COOLDOWN_HOURS || 72));
    const dailyCap = Math.max(1, Number(process.env.LEADS_OUTREACH_DAILY_CAP || 20));

    if (lead.lastContactedAt) {
      const hoursSinceLast = (now.getTime() - new Date(lead.lastContactedAt).getTime()) / 3600000;
      if (hoursSinceLast < cooldownHours) {
        const waitHours = Math.max(1, Math.ceil(cooldownHours - hoursSinceLast));
        return NextResponse.json(
          {
            error: "Lead outreach cooldown active",
            details: `Last outreach is too recent. Wait ~${waitHours} more hour(s) before sending again to this lead.`,
          },
          { status: 429 }
        );
      }
    }

    const allLeads = await listLeads().catch(() => []);
    const dayStart = new Date(now);
    dayStart.setUTCHours(0, 0, 0, 0);
    const sendsToday = allLeads.reduce((count, item) => {
      const events = Array.isArray(item.emailEvents) ? item.emailEvents : [];
      const sentTodayForLead = events.some((event) => {
        if (event?.type !== "sent" || !event?.at) return false;
        return new Date(event.at).getTime() >= dayStart.getTime();
      });
      return count + (sentTodayForLead ? 1 : 0);
    }, 0);

    if (sendsToday >= dailyCap) {
      return NextResponse.json(
        {
          error: "Daily outreach cap reached",
          details: `Daily cap is ${dailyCap} send(s). Increase LEADS_OUTREACH_DAILY_CAP to raise this limit.`,
        },
        { status: 429 }
      );
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
    } else if (lower.includes("daily outreach cap") || lower.includes("cooldown")) {
      hint = "Warmup guardrail triggered. Tune LEADS_OUTREACH_DAILY_CAP / LEADS_OUTREACH_COOLDOWN_HOURS if needed.";
    }

    return NextResponse.json(
      { error: "Failed to send outreach email", details, ...(hint ? { hint } : {}) },
      { status: 500 }
    );
  }
}
