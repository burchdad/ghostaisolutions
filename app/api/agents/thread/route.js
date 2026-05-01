import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { getAllPosts } from "@/lib/allPosts";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

async function generateThread({ title, excerpt, content, tweetCount = 10 }) {
  if (!OPENAI_API_KEY) return { error: "OPENAI_API_KEY not configured" };

  const systemPrompt = `You are the X/Twitter presence for Ghost AI Solutions — a boutique AI systems studio. Your threads are known for being practical, insightful, and building real authority. No fluff. Each tweet punches. You write as the founder — first person, direct. You don't use corporate voice. You teach things people can use.`;

  const userPrompt = `Turn this blog post into a viral X/Twitter thread:

Title: ${title}
Excerpt: ${excerpt || ""}
Content: ${(content || "").slice(0, 1200)}

Write a ${tweetCount}-tweet thread. Follow this structure:
- Tweet 1: HOOK — bold claim or surprising insight (under 200 chars, no hashtags)
- Tweets 2-${tweetCount - 2}: numbered insights, each standalone and punchy
- Tweet ${tweetCount - 1}: summary/synthesis
- Tweet ${tweetCount}: CTA — follow + link to blog post

Rules:
- Each tweet max 270 chars (leave room for thread numbering)
- Tweet 1 must stop the scroll — it's the most important
- Use line breaks within tweets for readability
- 2-3 hashtags maximum, only in final tweet
- Don't start consecutive tweets the same way

Return JSON only:
{
  "hookTweet": "...(tweet 1, the scroll-stopper)",
  "tweets": [
    { "number": 1, "text": "...", "type": "hook" },
    { "number": 2, "text": "...", "type": "insight" }
  ],
  "estimatedReach": "low|medium|high",
  "bestTimeToPost": "...(day + time suggestion)",
  "threadAngle": "...(1 sentence: the unique perspective this thread takes)"
}`;

  try {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.82,
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

  const posts = getAllPosts().slice(0, 20).map((p) => ({
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
  const { title, excerpt, content, tweetCount = 10 } = body;

  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const thread = await generateThread({ title, excerpt, content, tweetCount });
  if (thread.error) return NextResponse.json({ error: thread.error }, { status: 500 });

  return NextResponse.json({ success: true, thread, meta: { title, tweetCount } });
}
