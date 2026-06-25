import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/siteConfig";
import { createLead } from "@/lib/leadsStore";

export const runtime = "nodejs";

const FIELD_LABELS = [
  ["name", "Name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["smsConsent", "SMS Consent"],
  ["company", "Company"],
  ["industry", "Industry"],
  ["websiteUrl", "Current Website"],
  ["primaryNeed", "Primary Need"],
  ["offerPath", "Offer Path"],
  ["selectedServices", "Selected Services"],
  ["businessStage", "Business Stage"],
  ["teamSize", "Team Size"],
  ["revenueRange", "Revenue Range"],
  ["investmentComfort", "Investment Comfort"],
  ["projectType", "Project Type"],
  ["recommendedPath", "Recommended Path"],
  ["recommendedTier", "Recommended Tier"],
  ["desiredOutcome", "Primary Goal"],
  ["currentProblem", "Current Problem"],
  ["visualDirection", "Visual Direction"],
  ["exampleSites", "Example Sites"],
  ["budget", "Budget"],
  ["timeline", "Timeline"],
  ["highIntent", "Ready-Now Routing"],
];

function clean(value, max = 2000) {
  return String(value || "").trim().slice(0, max);
}

function cleanList(value, maxItems = 20) {
  return Array.isArray(value)
    ? value.map((item) => clean(item, 120)).filter(Boolean).slice(0, maxItems)
    : [];
}

function formatValue(value) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "";
  return value;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizePayload(body = {}) {
  const payload = {
    name: clean(body.name, 160),
    email: clean(body.email, 240),
    phone: clean(body.phone, 80),
    smsConsent: Boolean(body.smsConsent),
    company: clean(body.company, 180),
    industry: clean(body.industry, 180),
    websiteUrl: clean(body.websiteUrl, 500),
    primaryNeed: clean(body.primaryNeed, 160),
    offerPath: clean(body.offerPath, 160),
    selectedServices: cleanList(body.selectedServices),
    businessStage: clean(body.businessStage, 160),
    teamSize: clean(body.teamSize, 80),
    revenueRange: clean(body.revenueRange, 120),
    investmentComfort: clean(body.investmentComfort || body.budget, 120),
    projectType: clean(body.projectType, 160),
    recommendedPath: clean(body.recommendedPath, 180),
    recommendedTier: clean(body.recommendedTier, 120),
    desiredOutcome: clean(body.desiredOutcome, 2000),
    currentProblem: clean(body.currentProblem, 2000),
    visualDirection: clean(body.visualDirection, 2000),
    exampleSites: clean(body.exampleSites, 2000),
    budget: clean(body.budget, 80),
    timeline: clean(body.timeline, 80),
    highIntent: Boolean(body.highIntent),
    submittedAt: new Date().toISOString(),
  };

  payload.smsConsent = payload.smsConsent ? "Yes" : "No";
  payload.highIntent = payload.highIntent ? "Send to booking" : "Email follow-up";
  return payload;
}

function buildText(payload) {
  return FIELD_LABELS.map(([key, label]) => `${label}: ${formatValue(payload[key]) || "Not provided"}`).join("\n");
}

function buildHtml(payload) {
  const rows = FIELD_LABELS.map(([key, label]) => {
    const value = formatValue(payload[key]) || "Not provided";
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:#0f172a;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#334155;white-space:pre-wrap;">${escapeHtml(value)}</td>
      </tr>`;
  }).join("");

  return `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#0f172a;">
      <h1 style="margin:0 0 8px;font-size:24px;">New GhostAI Website Audit Intake</h1>
      <p style="margin:0 0 20px;color:#475569;">Submitted at ${escapeHtml(payload.submittedAt)}</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function normalizeDomain(websiteUrl = "") {
  const value = String(websiteUrl || "").trim();
  if (!value) return "";

  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return url.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return value
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .split("/")[0]
      .toLowerCase();
  }
}

function buildLeadNotes(payload) {
  return FIELD_LABELS.map(([key, label]) => `${label}: ${formatValue(payload[key]) || "Not provided"}`).join("\n");
}

function getLeadScore(payload) {
  const highIntent = payload.highIntent === "Send to booking";
  const urgentTimeline = ["now", "30-days", "2-4 weeks", "30 days"].includes(payload.timeline);
  const largerBudget = ["3k-5k", "5k+", "5-10k", "10k+"].includes(payload.investmentComfort || payload.budget);
  const total = highIntent ? 74 : largerBudget || urgentTimeline ? 64 : 56;

  return {
    fit: payload.projectType === "Not sure yet" ? 54 : 68,
    urgency: highIntent ? 76 : urgentTimeline ? 66 : 48,
    total,
    reasons: [
      "Submitted the GhostAI growth intake form.",
      payload.highIntent === "Send to booking"
        ? "Ready-now routing selected based on budget or timeline."
        : "Needs email follow-up before booking.",
      payload.recommendedTier ? `Recommended path: ${payload.recommendedTier}` : "",
      payload.desiredOutcome ? `Primary goal: ${payload.desiredOutcome}` : "",
    ].filter(Boolean),
  };
}

async function createIntakeLead(payload) {
  const domain = normalizeDomain(payload.websiteUrl);
  const companyName = payload.company || payload.name || "Website intake lead";
  const summary = [
    `Growth intake from ${payload.name || companyName}.`,
    payload.recommendedPath ? `Recommended path: ${payload.recommendedPath}.` : "",
    payload.recommendedTier ? `Recommended tier: ${payload.recommendedTier}.` : "",
    payload.desiredOutcome ? `Goal: ${payload.desiredOutcome}` : "",
  ].filter(Boolean).join(" ");

  return createLead({
    companyName,
    domain,
    website: payload.websiteUrl,
    sourceType: "website_intake",
    sourceUrl: "https://ghostai.solutions/start",
    ownerName: payload.name,
    ownerRole: payload.industry,
    ownerEmail: payload.email,
    contactEmail: payload.email,
    summary,
    status: "new",
    aiOpportunity: {
      score: payload.highIntent === "Send to booking" ? 72 : 58,
      reasons: [
        "Requested growth, marketing, website, software, or AI help.",
        payload.offerPath ? `Offer path: ${payload.offerPath}` : "",
        payload.currentProblem ? `Current issue: ${payload.currentProblem}` : "",
      ].filter(Boolean),
    },
    signals: {
      services: [payload.projectType, payload.recommendedTier, ...payload.selectedServices, payload.desiredOutcome, payload.industry].filter(Boolean),
      techHints: [payload.investmentComfort, payload.timeline, payload.teamSize, payload.revenueRange, `sms consent: ${payload.smsConsent}`].filter(Boolean),
    },
    score: getLeadScore(payload),
    notes: buildLeadNotes(payload),
  });
}

function getMissionControlClientsUrl() {
  const explicit =
    process.env.GHOST_MISSION_CONTROL_CLIENTS_URL ||
    process.env.MISSION_CONTROL_CLIENTS_URL ||
    "";
  if (explicit) return explicit;

  const base =
    process.env.GHOST_MISSION_CONTROL_URL ||
    process.env.MISSION_CONTROL_URL ||
    "https://ghostmissioncontrol-production.up.railway.app";
  return `${base.replace(/\/+$/, "")}/mission/clients`;
}

function buildMissionControlNotes(payload) {
  return [
    "GhostAI growth intake submitted from /start.",
    "",
    buildLeadNotes(payload),
  ].join("\n");
}

function getMissionServices(payload) {
  const selected = new Set(payload.selectedServices || []);
  const mapped = new Set(["website-build"]);

  if (selected.has("seo-aeo-geo") || payload.primaryNeed === "seo") mapped.add("search-intelligence");
  if (selected.has("social-management") || selected.has("video-commercials") || payload.primaryNeed === "social") mapped.add("content-social");
  if (selected.has("google-ads") || selected.has("social-ads") || payload.primaryNeed === "ads") mapped.add("paid-ads");
  if (selected.has("ai-automation") || payload.primaryNeed === "automation") mapped.add("ai-automation");
  if (selected.has("mobile-app") || selected.has("saas-build") || payload.primaryNeed === "software") mapped.add("software-tool");
  if (selected.has("fractional-cto") || payload.primaryNeed === "strategy") mapped.add("reporting");
  if (payload.primaryNeed === "more-leads" || selected.size > 1 || payload.offerPath === "package") mapped.add("lead-funnel");

  return [...mapped];
}

async function createMissionControlLead(payload) {
  const url = getMissionControlClientsUrl();
  if (!url) {
    return { skipped: "Mission Control client URL not configured" };
  }

  const body = {
    clientName: payload.company || payload.name,
    stage: "lead",
    status: "lead",
    leadStage: "new-lead",
    leadSource: "email",
    leadSourceDetail: "GhostAI website intake",
    relationshipType: "prospect",
    pricingTier: "standard",
    websiteUrl: payload.websiteUrl,
    businessEmail: payload.email,
    businessPhone: payload.phone,
    contact: payload.name,
    plan: payload.recommendedTier || payload.recommendedPath || payload.projectType || "Growth intake",
    services: ["website-build"],
    plannedServices: getMissionServices(payload).filter((service) => service !== "website-build"),
    proposalSent: false,
    depositInvoiceSent: false,
    proposalSigned: false,
    depositPaid: false,
    notes: buildMissionControlNotes(payload),
  };

  const headers = { "Content-Type": "application/json" };
  const secret = process.env.GHOST_MISSION_CONTROL_WEBHOOK_SECRET || process.env.MISSION_CONTROL_WEBHOOK_SECRET || "";
  if (secret) {
    headers["X-Ghost-Webhook-Secret"] = secret;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  let result = {};
  try {
    result = raw ? JSON.parse(raw) : {};
  } catch {
    result = { raw };
  }

  if (!response.ok) {
    throw new Error(`Mission Control lead create failed (${response.status}): ${raw}`);
  }

  return {
    url,
    clientId: result?.created?.id || null,
    clientName: result?.created?.clientName || body.clientName,
    storage: result?.storage || null,
  };
}

async function sendIntakeEmail(payload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const to = process.env.INTAKE_TO_EMAIL || process.env.RESEND_REPLY_TO || process.env.OUTREACH_REPLY_TO || siteConfig.supportEmail;
  const from = process.env.RESEND_FROM_EMAIL || "Ghost AI <newsletter@ghostai.solutions>";
  const replyTo = payload.email || process.env.RESEND_REPLY_TO || undefined;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject: `New GhostAI growth intake - ${payload.name || payload.company || "GhostAI lead"}`,
      html: buildHtml(payload),
      text: buildText(payload),
    }),
  });

  const raw = await response.text();
  let result = {};
  try {
    result = raw ? JSON.parse(raw) : {};
  } catch {
    result = { raw };
  }

  if (!response.ok) {
    throw new Error(`Resend intake send failed (${response.status}): ${raw}`);
  }

  return { to, id: result?.id || null };
}

async function sendConfirmationEmail(payload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !payload.email) {
    return { skipped: !apiKey ? "RESEND_API_KEY not configured" : "Lead email not provided" };
  }

  const from = process.env.RESEND_FROM_EMAIL || "Ghost AI <newsletter@ghostai.solutions>";
  const replyTo = process.env.RESEND_REPLY_TO || process.env.OUTREACH_REPLY_TO || siteConfig.supportEmail;
  const subject = "We received your Ghost AI growth intake";
  const bookingLine =
    payload.highIntent === "Send to booking"
      ? `Since your request looks ready-now, you can also grab a call time here: ${siteConfig.calendlyUrl}`
      : "We will review the intake first and follow up with the best next step.";

  const text = [
    `Hi ${payload.name || "there"},`,
    "",
    "Thanks for sending over your Ghost AI growth intake. We received it and have it queued for review.",
    bookingLine,
    "",
    "If anything changes, reply to this email and we will add it to your intake.",
    "",
    "Best,",
    "Ghost AI Solutions",
  ].join("\n");

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#0f172a;">
      <p>Hi ${escapeHtml(payload.name || "there")},</p>
      <p>Thanks for sending over your Ghost AI growth intake. We received it and have it queued for review.</p>
      <p>${escapeHtml(bookingLine)}</p>
      <p>If anything changes, reply to this email and we will add it to your intake.</p>
      <p>Best,<br/>Ghost AI Solutions</p>
    </div>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.email],
      reply_to: replyTo,
      subject,
      html,
      text,
    }),
  });

  const raw = await response.text();
  let result = {};
  try {
    result = raw ? JSON.parse(raw) : {};
  } catch {
    result = { raw };
  }

  if (!response.ok) {
    throw new Error(`Resend confirmation send failed (${response.status}): ${raw}`);
  }

  return { to: payload.email, id: result?.id || null };
}

async function postIntakeToSlack(payload) {
  const botToken = process.env.SLACK_BOT_TOKEN;
  const channel =
    process.env.SLACK_INTAKE_CHANNEL_ID ||
    process.env.INTAKE_SLACK_CHANNEL_ID ||
    process.env.SLACK_ALERTS_CHANNEL_ID ||
    process.env.SLACK_DEFAULT_CHANNEL_ID;

  const message = {
    text: `New GhostAI growth intake from ${payload.name || payload.company || "a lead"}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "New GhostAI Growth Intake" },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Name:*\n${payload.name || "Not provided"}` },
          { type: "mrkdwn", text: `*Email:*\n${payload.email || "Not provided"}` },
          { type: "mrkdwn", text: `*Company:*\n${payload.company || "Not provided"}` },
          { type: "mrkdwn", text: `*Path:*\n${payload.recommendedPath || payload.projectType || "Not provided"}` },
          { type: "mrkdwn", text: `*Investment:*\n${payload.investmentComfort || payload.budget || "Not provided"}` },
          { type: "mrkdwn", text: `*Recommended:*\n${payload.recommendedTier || "Not provided"}` },
          { type: "mrkdwn", text: `*Timeline:*\n${payload.timeline || "Not provided"}` },
        ],
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*Goal:*\n${payload.desiredOutcome || "Not provided"}` },
      },
    ],
  };

  if (botToken && channel) {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ channel, ...message }),
    });

    const result = await response.json();
    if (!response.ok || !result?.ok) {
      throw new Error(`Slack app intake post failed: ${result?.error || response.status}`);
    }

    return { posted: true, channel, ts: result.ts || null };
  }

  const webhook = process.env.SLACK_ALERTS_WEBHOOK || process.env.SLACK_OPS_SUMMARY_WEBHOOK;
  if (!webhook) return { skipped: "Slack webhook not configured" };

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Slack intake post failed (${response.status}): ${text}`);
  }

  return { posted: true };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const payload = normalizePayload(body);

    if (!payload.name || !payload.email || !payload.primaryNeed || !payload.offerPath || !payload.desiredOutcome) {
      return NextResponse.json({ error: "Missing required intake fields" }, { status: 400 });
    }

    const lead = await createIntakeLead(payload);
    const missionControl = await createMissionControlLead(payload).catch((error) => {
      console.error("Mission Control lead creation failed", error);
      return { error: "Mission Control lead creation failed" };
    });
    const email = await sendIntakeEmail(payload);
    const confirmation = await sendConfirmationEmail(payload).catch((error) => {
      console.error("Intake confirmation email failed", error);
      return { error: "Confirmation email failed" };
    });
    const slack = await postIntakeToSlack(payload).catch((error) => {
      console.error("Intake Slack notification failed", error);
      return { error: "Slack notification failed" };
    });

    return NextResponse.json({ success: true, leadId: lead.id, missionControl, email, confirmation, slack });
  } catch (error) {
    console.error("Intake submission failed", error);
    return NextResponse.json({ error: "Failed to submit intake" }, { status: 500 });
  }
}
