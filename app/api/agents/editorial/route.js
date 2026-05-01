import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import {
  listCalendarEntries, createCalendarEntry, updateCalendarEntry,
  deleteCalendarEntry, bulkCreateEntries, listThemes, saveTheme, getCalendarStats,
} from "@/lib/editorialStore";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

const CONTENT_TYPES = ["blog", "linkedin", "x-thread", "reel", "newsletter", "case-study"];
const BUYER_STAGES = ["awareness", "consideration", "decision"];
const SERVICE_PILLARS = ["AI Agents", "Workflow Automation", "Data Pipelines", "Voice AI", "Custom LLM", "Strategy"];

async function generateCalendar({ weekCount = 4, theme, focusPillar }) {
  if (!OPENAI_API_KEY) return { error: "OPENAI_API_KEY not configured" };

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const systemPrompt = `You are the content strategist for Ghost AI Solutions — a boutique AI systems studio targeting founders, COOs, and RevOps leads at 20-200 person B2B companies. You plan editorial calendars that build authority, generate inbound, and convert readers into booked discovery calls.

Service pillars: ${SERVICE_PILLARS.join(", ")}
Content types: ${CONTENT_TYPES.join(", ")}
Buyer journey stages: ${BUYER_STAGES.join(", ")}`;

  const userPrompt = `Plan a ${weekCount}-week editorial calendar starting ${startDate.toISOString().slice(0, 10)}.
${theme ? `Monthly theme: "${theme}"` : ""}
${focusPillar ? `Focus service pillar: "${focusPillar}"` : ""}

Rules:
- 1 blog post per week (Mon or Tue)
- 3-4 social posts per week spread across LinkedIn/X
- 1 X thread every 2 weeks
- 1 newsletter per week (Thu)
- Mix awareness (50%) + consideration (30%) + decision (20%) content
- No two consecutive posts on the same topic
- Vary between educational, opinion, case-study-style, and trend-reaction formats

Return JSON only:
{
  "theme": "...(calendar theme name)",
  "summary": "...(1-2 sentences describing the strategic intent)",
  "entries": [
    {
      "scheduledDate": "YYYY-MM-DD",
      "contentType": "blog|linkedin|x-thread|reel|newsletter|case-study",
      "platform": "website|linkedin|x|instagram|email",
      "title": "...",
      "angle": "...(1 sentence: the unique take or hook)",
      "buyerStage": "awareness|consideration|decision",
      "pillar": "...(service pillar)",
      "keyMessage": "...(the core message in ≤15 words)"
    }
  ]
}`;

  try {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.75,
        max_tokens: 4000,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    return { error: e.message };
  }
}

export async function GET() {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = listCalendarEntries();
  const themes = listThemes();
  const stats = getCalendarStats();
  return NextResponse.json({ entries, themes, stats });
}

export async function POST(request) {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { action } = body;

  if (action === "generate") {
    const { weekCount, theme, focusPillar } = body;
    const plan = await generateCalendar({ weekCount: weekCount || 4, theme, focusPillar });
    if (plan.error) return NextResponse.json({ error: plan.error }, { status: 500 });
    const created = bulkCreateEntries(plan.entries || []);
    if (plan.theme) saveTheme({ name: plan.theme, summary: plan.summary });
    const stats = getCalendarStats();
    return NextResponse.json({ success: true, created: created.length, entries: created, stats, summary: plan.summary });
  }

  if (action === "add-entry") {
    const entry = createCalendarEntry(body.entry);
    return NextResponse.json({ success: true, entry });
  }

  if (action === "update-entry") {
    const updated = updateCalendarEntry(body.id, body.patch);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, entry: updated });
  }

  if (action === "delete-entry") {
    deleteCalendarEntry(body.id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
