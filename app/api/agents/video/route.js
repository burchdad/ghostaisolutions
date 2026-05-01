import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { getAllPosts } from "@/lib/allPosts";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// ─── Script Generator ─────────────────────────────────────────────────────────

async function generateVideoScript({ title, excerpt, content, format, duration }) {
  if (!OPENAI_API_KEY) return { error: "OPENAI_API_KEY not configured" };

  const durationMap = {
    "15s": { words: "25-35 words", sections: "hook + punchline CTA" },
    "30s": { words: "60-80 words", sections: "hook + 1 core insight + CTA" },
    "60s": { words: "130-150 words", sections: "hook + 3 quick value points + CTA" },
    "90s": { words: "200-225 words", sections: "hook + problem + 3 solutions + CTA" },
  };

  const spec = durationMap[duration] || durationMap["60s"];

  const formatGuide = {
    reel:       "Instagram Reel / TikTok short-form video. Energetic hook in first 2 seconds. Fast-paced, snappy sentences. End with a strong visual CTA.",
    linkedin:   "LinkedIn video. More measured, professional. Establish credibility. Lead with insight, not hype.",
    youtube:    "YouTube Short or intro. Story-driven. Conversational. Build curiosity before delivering value.",
    podcast:    "Podcast clip / audiogram. Spoken-word friendly, natural cadence. No visual references.",
  }[format] || "general short-form video";

  const systemPrompt = `You are a video script writer for Ghost AI Solutions — a company that builds custom AI systems, agents, and workflow automation. Your scripts are sharp, confident, and valuable. You lead with insight not buzzwords. You speak to founders, ops leaders, and growth-minded professionals.`;

  const userPrompt = `Write a ${duration} video script for this topic:

Title: ${title}
Excerpt: ${excerpt || ""}
Content summary: ${(content || "").slice(0, 600)}

Format: ${formatGuide}
Target length: ~${spec.words} (spoken word, not reading)
Structure: ${spec.sections}

Return JSON only:
{
  "hook": "...(first spoken line, must grab attention instantly)",
  "script": "...(full spoken script, use line breaks between sentences)",
  "cta": "...(the final call to action line)",
  "bRollSuggestions": ["...", "...", "..."],
  "captionText": "...(on-screen text for opening caption, under 8 words)",
  "hashtags": ["...", "...", "..."],
  "voiceNotes": "...(optional: tone/pace guidance for recording)"
}`;

  try {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    return { error: e.message };
  }
}

// ─── Route Handlers ───────────────────────────────────────────────────────────

export async function GET() {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = getAllPosts()
    .slice(0, 20)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt || "",
      content: p.sections?.map((s) => (typeof s === "string" ? s : s.text || s.items?.join(" ") || "")).join(" ") || "",
      date: p.date,
    }));

  return NextResponse.json({ posts });
}

export async function POST(request) {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { title, excerpt, content, format = "reel", duration = "60s" } = body;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const script = await generateVideoScript({ title, excerpt, content, format, duration });

  if (script.error) {
    return NextResponse.json({ error: script.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, script, meta: { title, format, duration } });
}
