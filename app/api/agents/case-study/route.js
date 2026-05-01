import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

async function generateCaseStudy({ clientType, industry, challenge, approach, results, timeframe }) {
  if (!OPENAI_API_KEY) return { error: "OPENAI_API_KEY not configured" };

  const systemPrompt = `You are a B2B case study writer for Ghost AI Solutions — an AI systems studio. Your case studies follow the "Hero Stat → Problem → Approach → Results → ROI → CTA" framework. You write clearly, concretely, and without buzzwords. You help potential clients see themselves in the story.`;

  const userPrompt = `Write a case study from this client project brief:

Client Type: ${clientType}
Industry: ${industry}
Challenge: ${challenge}
Our Approach: ${approach}
Results: ${results}
Timeframe: ${timeframe}

Return JSON only:
{
  "caseStudy": {
    "heroStat": "...(the #1 most impressive outcome in ≤12 words, e.g. '340% faster lead response without hiring a single SDR')",
    "title": "...(SEO-friendly case study title)",
    "summary": "...(2-3 sentence overview for social sharing)",
    "sections": [
      { "heading": "The Challenge", "body": "..." },
      { "heading": "Our Approach", "body": "..." },
      { "heading": "The Results", "body": "..." },
      { "heading": "The ROI", "body": "..." }
    ],
    "testimonialPlaceholder": "...(suggested testimonial quote that the client could endorse — mark as [DRAFT FOR CLIENT APPROVAL])"
  },
  "socialVariant": {
    "linkedin": "...(200-300 word LinkedIn post version with the hero stat in first 2 lines)",
    "x": "...(280 char punchy tweet version)"
  },
  "testimonialRequest": {
    "emailSubject": "...",
    "emailBody": "...(friendly email to client asking for a quote, with suggested quote pre-filled for them to edit)"
  },
  "seoKeywords": ["...", "..."],
  "callToAction": "...(1 sentence CTA for the bottom of the case study)"
}`;

  try {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    return { error: e.message };
  }
}

export async function POST(request) {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { clientType, industry, challenge, approach, results, timeframe } = body;

  if (!challenge || !results) return NextResponse.json({ error: "challenge and results are required" }, { status: 400 });

  const output = await generateCaseStudy({ clientType, industry, challenge, approach, results, timeframe });
  if (output.error) return NextResponse.json({ error: output.error }, { status: 500 });

  return NextResponse.json({ success: true, ...output });
}
