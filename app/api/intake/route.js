import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/siteConfig";

export const runtime = "nodejs";

const FIELD_LABELS = [
  ["name", "Name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["smsConsent", "SMS Consent"],
  ["company", "Company"],
  ["industry", "Industry"],
  ["websiteUrl", "Current Website"],
  ["projectType", "Project Type"],
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
    projectType: clean(body.projectType, 160),
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
  return FIELD_LABELS.map(([key, label]) => `${label}: ${payload[key] || "Not provided"}`).join("\n");
}

function buildHtml(payload) {
  const rows = FIELD_LABELS.map(([key, label]) => {
    const value = payload[key] || "Not provided";
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
      subject: `New website audit intake - ${payload.name || payload.company || "GhostAI lead"}`,
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

async function postIntakeToSlack(payload) {
  const webhook = process.env.INTAKE_SLACK_WEBHOOK || process.env.SLACK_ALERTS_WEBHOOK || process.env.SLACK_OPS_SUMMARY_WEBHOOK;
  if (!webhook) return { skipped: "Slack webhook not configured" };

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `New GhostAI website audit intake from ${payload.name || payload.company || "a lead"}`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "New Website Audit Intake" },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Name:*\n${payload.name || "Not provided"}` },
            { type: "mrkdwn", text: `*Email:*\n${payload.email || "Not provided"}` },
            { type: "mrkdwn", text: `*Company:*\n${payload.company || "Not provided"}` },
            { type: "mrkdwn", text: `*Project:*\n${payload.projectType || "Not provided"}` },
            { type: "mrkdwn", text: `*Budget:*\n${payload.budget || "Not provided"}` },
            { type: "mrkdwn", text: `*Timeline:*\n${payload.timeline || "Not provided"}` },
          ],
        },
        {
          type: "section",
          text: { type: "mrkdwn", text: `*Goal:*\n${payload.desiredOutcome || "Not provided"}` },
        },
      ],
    }),
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

    if (!payload.name || !payload.email || !payload.projectType || !payload.desiredOutcome) {
      return NextResponse.json({ error: "Missing required intake fields" }, { status: 400 });
    }

    const email = await sendIntakeEmail(payload);
    const slack = await postIntakeToSlack(payload).catch((error) => {
      console.error("Intake Slack notification failed", error);
      return { error: "Slack notification failed" };
    });

    return NextResponse.json({ success: true, email, slack });
  } catch (error) {
    console.error("Intake submission failed", error);
    return NextResponse.json({ error: "Failed to submit intake" }, { status: 500 });
  }
}
