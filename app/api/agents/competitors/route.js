import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import { listCompetitors, upsertCompetitor, updateCompetitor, removeCompetitor, saveScans, listScans, getCompetitorStats } from "@/lib/competitorStore";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

// ─── Scraper ──────────────────────────────────────────────────────────────────

async function scrapeCompetitorSignals(competitor) {
  const signals = [];

  // Blog/content signals via RSS
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
        const pubDate = (/<pubDate>([\s\S]*?)<\/pubDate>/i.exec(block) || [])[1]?.trim() || "";
        if (title && link) items.push({ title, url: link, date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString() });
      }
      if (items.length > 0) {
        signals.push({ type: "content", count: items.length, recentPosts: items.slice(0, 3) });
        break;
      }
    } catch { /* skip */ }
  }

  // LinkedIn recent activity via search
  try {
    const query = `site:linkedin.com/company "${competitor.name}" OR site:${competitor.domain}`;
    // We can't scrape LinkedIn directly, but we check their public blog
    const homeRes = await fetch(`https://${competitor.domain}`, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(5000) });
    if (homeRes.ok) {
      const html = await homeRes.text();
      const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
      const metaDesc = /meta[^>]+name=['"](description)['"'][^>]+content=['"]([\s\S]*?)['"]/i.exec(html);
      signals.push({
        type: "homepage",
        title: titleMatch?.[1]?.trim() || competitor.name,
        description: metaDesc?.[2]?.trim() || "",
      });
    }
  } catch { /* skip */ }

  return signals;
}

async function analyzeCompetitor(competitor, signals) {
  if (!OPENAI_API_KEY) return { error: "OPENAI_API_KEY not configured" };

  const signaturesText = JSON.stringify(signals).slice(0, 1500);

  const systemPrompt = `You are a competitive intelligence analyst for Ghost AI Solutions — an AI systems studio competing for B2B AI automation clients. Analyze competitors objectively and surface actionable differentiation opportunities.`;

  const userPrompt = `Analyze this competitor based on the signals collected:

Competitor: ${competitor.name} (${competitor.domain})
Signals: ${signaturesText}

Return JSON only:
{
  "positioningSummary": "...(1-2 sentences: how they position themselves)",
  "contentFocus": "...(what topics they seem to focus on)",
  "apparentStrengths": ["...", "..."],
  "apparentWeaknesses": ["...", "..."],
  "differentiationOpportunity": "...(1-2 sentences: where Ghost AI can stand apart)",
  "actionableInsight": "...(1 specific thing Ghost AI should do in response this week)",
  "threatLevel": "low|medium|high"
}`;

  try {
    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.6,
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

  const competitors = listCompetitors();
  const scans = listScans({ limit: 20 });
  const stats = getCompetitorStats();
  return NextResponse.json({ competitors, scans, stats });
}

export async function POST(request) {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { action } = body;

  if (action === "add") {
    const { name, domain, linkedinUrl, twitterHandle, notes } = body;
    if (!name || !domain) return NextResponse.json({ error: "name and domain required" }, { status: 400 });
    const result = upsertCompetitor({ name, domain, linkedinUrl, twitterHandle, notes });
    return NextResponse.json(result);
  }

  if (action === "remove") {
    removeCompetitor(body.id);
    return NextResponse.json({ success: true });
  }

  if (action === "scan") {
    const competitors = listCompetitors();
    if (competitors.length === 0) return NextResponse.json({ error: "No competitors added yet" }, { status: 400 });

    const scanResults = [];
    for (const comp of competitors) {
      const signals = await scrapeCompetitorSignals(comp);
      const analysis = await analyzeCompetitor(comp, signals);
      const scan = {
        competitorId: comp.id,
        competitorName: comp.name,
        domain: comp.domain,
        signals,
        analysis,
      };
      scanResults.push(scan);
      updateCompetitor(comp.id, { lastScannedAt: new Date().toISOString() });
    }

    const saved = saveScans(scanResults);
    const stats = getCompetitorStats();
    return NextResponse.json({ success: true, scanned: saved.length, scans: saved, stats });
  }

  if (action === "scan-one") {
    const comp = listCompetitors().find((c) => c.id === body.id);
    if (!comp) return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    const signals = await scrapeCompetitorSignals(comp);
    const analysis = await analyzeCompetitor(comp, signals);
    const saved = saveScans([{ competitorId: comp.id, competitorName: comp.name, domain: comp.domain, signals, analysis }]);
    updateCompetitor(comp.id, { lastScannedAt: new Date().toISOString() });
    return NextResponse.json({ success: true, scan: saved[0] });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
