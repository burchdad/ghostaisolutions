import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { listLeads } from "@/lib/leadsStore";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

function fallbackPlan({ channel, industry, location, intent }) {
  const intakeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://ghostai.solutions"}/start`;
  return {
    headline: "One-week high-intent website audit sprint",
    objective: "Create enough direct conversations to land one qualified website, automation, or AI systems client this week.",
    bestTargets: [
      `${industry || "Local service businesses"} in ${location || "your local market"} with outdated websites`,
      "Businesses with weak mobile experience, buried contact buttons, or no booking/request flow",
      "Owners/founders active on LinkedIn but sending traffic to an underpowered website",
    ],
    dailyPlan: [
      "Day 1: Build a list of 25 Google/local prospects and 15 LinkedIn company prospects.",
      "Day 2: Send 15 personalized audit offers and connect with 10 owners/operators on LinkedIn.",
      "Day 3: Follow up with a screenshot note showing one fix that would improve trust or lead capture.",
      "Day 4: Send 10 more audits focused on higher-ticket businesses and ask for a 15-minute review call.",
      "Day 5: Re-engage warm replies and push the best fits to the /start intake.",
    ],
    googleAngles: [
      "Your website is hard to act on from mobile.",
      "Your contact/request path is buried for ready-to-buy visitors.",
      "You have trust signals, but they are not showing up early enough.",
    ],
    linkedinAngles: [
      "Saw your company on LinkedIn and checked the site.",
      "Your offer looks strong, but the website could make the next step clearer.",
      "I can send a short teardown with 2-3 concrete fixes.",
    ],
    firstTouch: `Hey, I help small businesses improve websites so more visitors actually call, book, or request a quote. I took a quick look and noticed a couple places where your site could make the next step clearer. If useful, start here and I will send a short audit: ${intakeUrl}`,
    followUp: "Quick follow-up. I am doing a few free website/lead path audits this week for local businesses. If you want one, send the best website URL or use the intake link and I will send back concrete notes.",
    successMetrics: [
      "40-50 researched prospects",
      "25-30 personalized first touches",
      "5-8 replies or intake starts",
      "2-3 qualified calls",
      "1 proposal for a higher-value build",
    ],
  };
}

function parsePlan(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export async function POST(request) {
  if (!ensureAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const context = {
    channel: body.channel || "google",
    industry: body.industry || "",
    location: body.location || "",
    intent: body.intent || "",
    limit: body.limit || 25,
  };

  const leads = await listLeads().catch(() => []);
  const recentLeadContext = leads.slice(0, 12).map((lead) => ({
    companyName: lead.companyName,
    status: lead.status,
    score: lead.score?.total || 0,
    sourceType: lead.sourceType,
    website: lead.website,
    linkedinUrl: lead.linkedinUrl,
    contactEmail: lead.contactEmail || lead.ownerEmail || "",
  }));

  const fallback = fallbackPlan(context);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: true, plan: fallback, model: "template-fallback" });
  }

  const intakeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://ghostai.solutions"}/start`;
  const prompt = `You are GhostAI Solutions' AI outreach strategist. The founder needs to land one meaningful client this week.

Campaign target:
- Channel focus: ${context.channel}
- Industry/niche: ${context.industry}
- Location: ${context.location}
- Pain/intent: ${context.intent}
- Intake CTA: ${intakeUrl}

Recent leads context:
${JSON.stringify(recentLeadContext, null, 2)}

Return JSON only with:
{
  "headline": "...",
  "objective": "...",
  "bestTargets": ["...", "..."],
  "dailyPlan": ["Day 1: ...", "Day 2: ..."],
  "googleAngles": ["...", "..."],
  "linkedinAngles": ["...", "..."],
  "firstTouch": "...",
  "followUp": "...",
  "successMetrics": ["...", "..."]
}

Rules:
- Be practical and aggressive but not spammy.
- Push prospects toward the intake URL, not a generic consultation.
- Prioritize businesses with money, urgency, and visible website/conversion weakness.
- Mention Google/local search and LinkedIn tactics separately.
- Keep messages short enough to actually send.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.45,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You produce concise JSON outreach plans for B2B lead generation." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ success: true, plan: fallback, model: "template-fallback" });
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content || "";
  return NextResponse.json({
    success: true,
    plan: parsePlan(raw, fallback),
    model: data?.model || process.env.OPENAI_MODEL || "unknown",
  });
}
