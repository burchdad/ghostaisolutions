const SERVICE_KEYWORDS = [
  "automation",
  "workflow",
  "crm",
  "ecommerce",
  "bookings",
  "consulting",
  "agency",
  "marketing",
  "sales",
  "operations",
  "support",
  "recruiting",
  "analytics",
  "dashboard",
  "integrations",
  "lead generation",
  "appointment",
  "saas",
  "ai",
  "chatbot",
  "voice agent",
];

const TECH_HINT_PATTERNS = [
  { key: "hubspot", pattern: /hubspot/i },
  { key: "salesforce", pattern: /salesforce/i },
  { key: "zapier", pattern: /zapier/i },
  { key: "wordpress", pattern: /wp-content|wordpress/i },
  { key: "shopify", pattern: /shopify/i },
  { key: "webflow", pattern: /webflow/i },
  { key: "nextjs", pattern: /_next\//i },
  { key: "calendly", pattern: /calendly/i },
  { key: "intercom", pattern: /intercom/i },
  { key: "drift", pattern: /drift/i },
  { key: "segment", pattern: /segment/i },
  { key: "gtm", pattern: /googletagmanager|gtm.js/i },
];

const BUSINESS_ROLE_HINTS = ["founder", "ceo", "owner", "co-founder", "president", "managing director"];

function cleanText(input = "") {
  return String(input)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeUrl(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function getDomain(url) {
  try {
    const hostname = new URL(normalizeUrl(url)).hostname.toLowerCase();
    return hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function detectServices(text = "") {
  const lower = text.toLowerCase();
  return SERVICE_KEYWORDS.filter((keyword) => lower.includes(keyword)).slice(0, 12);
}

function detectTechHints(html = "") {
  return TECH_HINT_PATTERNS.filter((item) => item.pattern.test(html)).map((item) => item.key);
}

function findEmail(html = "") {
  const emails = html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  const filtered = emails.filter((email) => !/example\.com|wixpress\.com/i.test(email));
  return filtered[0] || "";
}

function findLinkedIn(html = "") {
  const match = html.match(/https?:\/\/(?:www\.)?linkedin\.com\/[A-Za-z0-9_\-/?=&.%]+/i);
  return match ? match[0] : "";
}

function inferOwnerFromText(text = "") {
  const lower = text.toLowerCase();
  const role = BUSINESS_ROLE_HINTS.find((hint) => lower.includes(hint));
  return role ? role.toUpperCase() : "";
}

function inferCompanyName(url, title) {
  const byTitle = String(title || "").split(/[|\-–]/)[0]?.trim();
  if (byTitle) return byTitle;
  const domain = getDomain(url);
  if (!domain) return "Unknown company";
  const root = domain.split(".")[0] || domain;
  return root
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function scoreLeadFromSignals(signals = {}) {
  let fit = 40;
  let urgency = 30;
  const reasons = [];

  if (Array.isArray(signals.services) && signals.services.length >= 4) {
    fit += 20;
    reasons.push("Services indicate active revenue operations and process complexity.");
  }

  if (signals.hasScheduling) {
    fit += 10;
    urgency += 8;
    reasons.push("Scheduling flow suggests immediate conversion optimization opportunities.");
  }

  if (signals.hasNewsletter) {
    fit += 8;
    reasons.push("Existing audience channel can amplify AI personalization quickly.");
  }

  if (signals.hasBlog) {
    fit += 8;
    reasons.push("Content engine already exists and can be automated with AI workflows.");
  }

  if (signals.hasChatWidget) {
    urgency += 10;
    reasons.push("Chat presence suggests active inbound volume suitable for AI lead triage.");
  }

  if (!signals.mentionsAI) {
    urgency += 12;
    reasons.push("Low explicit AI footprint creates clear transformation angle.");
  } else {
    urgency += 4;
    reasons.push("Already AI-aware; likely receptive to advanced systems implementation.");
  }

  if (Array.isArray(signals.techHints) && signals.techHints.length > 0) {
    fit += 8;
    reasons.push("Detectable modern stack improves implementation feasibility.");
  }

  fit = Math.max(0, Math.min(100, fit));
  urgency = Math.max(0, Math.min(100, urgency));
  const total = Math.round((fit * 0.6) + (urgency * 0.4));

  const aiReasons = [];
  if (!signals.mentionsAI) {
    aiReasons.push("No strong AI positioning detected on-site.");
  }
  if (signals.hasScheduling) {
    aiReasons.push("Scheduling flow could benefit from AI qualification and routing.");
  }
  if (signals.hasBlog) {
    aiReasons.push("Blog pipeline can be repurposed into social and nurture journeys.");
  }
  if (signals.hasChatWidget) {
    aiReasons.push("Inbound chat can be upgraded to intent-aware AI assistant.");
  }

  return {
    fit,
    urgency,
    total,
    reasons: reasons.slice(0, 8),
    aiOpportunity: {
      score: Math.max(0, Math.min(100, Math.round(total + (signals.mentionsAI ? -5 : 8)))),
      reasons: aiReasons.slice(0, 6),
    },
  };
}

export async function scrapeBusinessWebsite(sourceUrl) {
  const website = normalizeUrl(sourceUrl);
  if (!website) {
    throw new Error("Missing website URL");
  }

  const response = await fetch(website, {
    headers: {
      "User-Agent": "GhostAISolutions-LeadIntelligence/1.0",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(`Website fetch failed (${response.status})`);
  }

  const html = await response.text();
  const text = cleanText(html).slice(0, 12000);

  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim();
  const description = (html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i)?.[1] || "").trim();

  const domain = getDomain(website);
  const companyName = inferCompanyName(website, title);
  const contactEmail = findEmail(html);
  const linkedinUrl = findLinkedIn(html);

  const lower = text.toLowerCase();
  const signals = {
    hasBlog: /\bblog\b/.test(lower) || /\/blog\b/i.test(html),
    hasNewsletter: /newsletter|subscribe|join our list/.test(lower),
    hasScheduling: /book a call|schedule|calendly|demo/.test(lower),
    hasChatWidget: /intercom|drift|chat widget|live chat/.test(lower),
    mentionsAI: /\b(ai|artificial intelligence|machine learning|automation agent|llm)\b/.test(lower),
    services: detectServices(text),
    techHints: detectTechHints(html),
  };

  const score = scoreLeadFromSignals(signals);

  return {
    companyName,
    domain,
    website,
    sourceType: "scraped",
    sourceUrl: website,
    ownerName: "",
    ownerRole: inferOwnerFromText(text),
    ownerEmail: "",
    contactEmail,
    linkedinUrl,
    summary: description || title || `Discovered from ${domain}`,
    signals,
    score: {
      fit: score.fit,
      urgency: score.urgency,
      total: score.total,
      reasons: score.reasons,
    },
    aiOpportunity: score.aiOpportunity,
    status: score.total >= 75 ? "qualified" : score.total >= 60 ? "ready_outreach" : "new",
  };
}

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function generateOutreachDraft(lead) {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const apiKey = process.env.OPENAI_API_KEY;

  const fallbackSubject = `Idea to help ${lead.companyName} increase qualified leads`;
  const fallbackBody = [
    `Hi ${lead.ownerName || "there"},`,
    "",
    `I took a look at ${lead.companyName}${lead.website ? ` (${lead.website})` : ""} and noticed a few opportunities to strengthen your lead funnel.`,
    "",
    "Based on your current setup, we can usually help teams like yours with:",
    "- AI-assisted lead qualification before calendar booking",
    "- Faster follow-up automation so good leads do not go cold",
    "- Converting existing content into multi-channel nurture sequences",
    "",
    "If useful, I can share a 1-page blueprint tailored to your stack and growth goals.",
    "",
    "Best,",
    "Ghost AI Solutions",
  ].join("\n");

  if (!apiKey) {
    return {
      subject: fallbackSubject,
      body: fallbackBody,
      generatedAt: new Date().toISOString(),
      model: "template-fallback",
    };
  }

  const prompt = `You are writing a concise, high-quality cold outreach email for a boutique AI systems studio.

Lead details:
- Company: ${lead.companyName}
- Website: ${lead.website}
- Owner: ${lead.ownerName || "Unknown"}
- Role: ${lead.ownerRole || "Unknown"}
- Signals: ${JSON.stringify(lead.signals || {})}
- Score: ${JSON.stringify(lead.score || {})}
- AI opportunity: ${JSON.stringify(lead.aiOpportunity || {})}

Rules:
- Keep it 110-170 words.
- Tone: direct, practical, not hypey.
- Mention 1-2 concrete observations from the signals.
- End with one low-friction CTA.
- Return JSON only with keys: subject, body.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You write conversion-focused B2B outreach emails." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI draft generation failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content || "";
  const parsed = safeJsonParse(raw);

  if (!parsed?.subject || !parsed?.body) {
    return {
      subject: fallbackSubject,
      body: fallbackBody,
      generatedAt: new Date().toISOString(),
      model: "template-fallback",
    };
  }

  return {
    subject: String(parsed.subject).slice(0, 160),
    body: String(parsed.body).slice(0, 5000),
    generatedAt: new Date().toISOString(),
    model,
  };
}

export async function sendLeadEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || process.env.OUTREACH_FROM_EMAIL || "Ghost AI <outreach@ghostai.solutions>";

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || `Resend send failed (${response.status})`);
  }

  return payload;
}

export function toSimpleHtml(text = "") {
  return String(text)
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}
