import { NextResponse } from "next/server";
import { listCompetitors, updateCompetitor, saveScans } from "@/lib/competitorStore";

function getCronSecret() {
  return process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

async function scrapeSignals(competitor) {
  const signals = [];
  const rssUrls = [
    `https://${competitor.domain}/feed`,
    `https://${competitor.domain}/feed/`,
    `https://${competitor.domain}/rss`,
    `https://${competitor.domain}/blog/feed`,
  ];
  for (const rssUrl of rssUrls) {
    try {
      const res = await fetch(rssUrl, { headers: { "User-Agent": "GhostAISolutions-CompBot/1.0" }, signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = [];
      for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
        const block = m[1];
        const title = (/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i.exec(block) || [])[1]?.trim() || "";
        const link = (/<link>(https?:\/\/[^<]+)<\/link>/.exec(block) || [])[1]?.trim() || "";
        if (title && link) items.push({ title, url: link });
      }
      if (items.length > 0) { signals.push({ type: "content", count: items.length, recentPosts: items.slice(0, 3) }); break; }
    } catch { /* skip */ }
  }
  return signals;
}

async function analyzeCompetitor(competitor, signals) {
  if (!OPENAI_API_KEY) return {};
  try {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "Competitive intelligence analyst for Ghost AI Solutions — an AI systems studio." },
          { role: "user", content: `Analyze competitor ${competitor.name} (${competitor.domain}) signals: ${JSON.stringify(signals).slice(0, 800)}. Return JSON: {"positioningSummary":"...","contentFocus":"...","apparentStrengths":["..."],"apparentWeaknesses":["..."],"differentiationOpportunity":"...","actionableInsight":"...","threatLevel":"low|medium|high"}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
      }),
    });
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch { return {}; }
}

export async function GET(request) {
  const auth = request.headers.get("authorization") || "";
  const cronSecret = getCronSecret();
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const competitors = listCompetitors();
  if (competitors.length === 0) return NextResponse.json({ success: true, scanned: 0, message: "No competitors tracked" });

  const scanResults = [];
  for (const comp of competitors) {
    const signals = await scrapeSignals(comp);
    const analysis = await analyzeCompetitor(comp, signals);
    scanResults.push({ competitorId: comp.id, competitorName: comp.name, domain: comp.domain, signals, analysis });
    updateCompetitor(comp.id, { lastScannedAt: new Date().toISOString() });
  }

  const saved = saveScans(scanResults);
  return NextResponse.json({ success: true, scanned: saved.length });
}
