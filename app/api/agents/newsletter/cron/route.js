import { NextResponse } from "next/server";
import { listSubscribers, listCampaigns, createCampaign, updateCampaign } from "@/lib/newsletterStore";
import { getAllPosts } from "@/lib/allPosts";

function getCronSecret() {
  return process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "newsletter@ghostai.solutions";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://ghostai.solutions";

export async function GET(request) {
  const auth = request.headers.get("authorization") || "";
  const cronSecret = getCronSecret();
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const missingEnv = [];
  if (!OPENAI_API_KEY) missingEnv.push("OPENAI_API_KEY");
  if (!RESEND_API_KEY) missingEnv.push("RESEND_API_KEY");
  if (missingEnv.length > 0) {
    return NextResponse.json(
      { error: "Missing required environment variables", missing: missingEnv },
      { status: 500 }
    );
  }

  const posts = getAllPosts().slice(0, 5);

  // Generate digest via OpenAI
  let campaign;
  try {
    const postsText = posts.map((p) => `- ${p.title}: ${p.excerpt || ""}`).join("\n");
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "You write weekly newsletter digests for Ghost AI Solutions — an AI systems studio for B2B operators. Your tone is smart, practical, and never salesy. First-person, from the founder." },
          { role: "user", content: `Write a weekly newsletter digest based on these recent posts:\n${postsText}\n\nReturn JSON: {"subject":"...","headline":"...","intro":"...","sections":[{"title":"...","body":"...","url":"..."}],"closingNote":"...","ps":"..."}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.72,
      }),
    });
    const data = await res.json();
    const responseContent = data?.choices?.[0]?.message?.content;
    if (!responseContent) {
      throw new Error("OpenAI returned an unexpected response payload");
    }
    const content = JSON.parse(responseContent);
    campaign = createCampaign({ type: "weekly-digest", subject: content.subject, content, status: "draft" });
  } catch (e) {
    return NextResponse.json({ error: `Digest generation failed: ${e.message}` }, { status: 500 });
  }

  // Send to active subscribers
  const subscribers = listSubscribers().filter((s) => s.status === "active");
  let sent = 0;
  for (const sub of subscribers) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: sub.email,
          subject: campaign.subject,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#e2e8f0;background:#0f172a;padding:32px;border-radius:12px">
            <h1 style="color:#67e8f9">${campaign.content.headline}</h1>
            <p>${campaign.content.intro}</p>
            ${(campaign.content.sections || []).map((s) => `<h3 style="color:#fff">${s.title}</h3><p>${s.body}</p>${s.url ? `<a href="${BASE_URL}${s.url}" style="color:#67e8f9">Read more →</a>` : ""}`).join("<hr style='border-color:#1e293b;margin:16px 0'>")}
            ${campaign.content.closingNote ? `<p style="color:#94a3b8">${campaign.content.closingNote}</p>` : ""}
            ${campaign.content.ps ? `<p style="color:#64748b;font-style:italic">P.S. ${campaign.content.ps}</p>` : ""}
            <p style="font-size:12px;color:#475569;margin-top:32px">You're receiving this because you subscribed to Ghost AI Solutions newsletter. <a href="${BASE_URL}/unsubscribe" style="color:#475569">Unsubscribe</a></p>
          </div>`,
        }),
      });
      sent++;
    } catch { /* continue */ }
  }

  updateCampaign(campaign.id, { status: "sent", sentAt: new Date().toISOString(), sentCount: sent });
  return NextResponse.json({ success: true, sent, campaignId: campaign.id });
}
