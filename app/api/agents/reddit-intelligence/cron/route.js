import { NextResponse } from "next/server";
import { scanRedditIntelligence } from "@/lib/redditIntelligence";
import { getRedditIntelligenceStats, upsertRedditOpportunities } from "@/lib/redditIntelligenceStore";
import { withCronLogging } from "@/lib/cronRuns";

export const maxDuration = 60;

function getCronSecret() {
  return process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
}

async function handle(request) {
  const auth = request.headers.get("authorization") || "";
  const cronSecret = getCronSecret();
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const scan = await scanRedditIntelligence();
    const saved = await upsertRedditOpportunities(scan.opportunities);
    const stats = await getRedditIntelligenceStats();
    return NextResponse.json({
      success: true,
      found: scan.opportunities.length,
      added: saved.added,
      updated: saved.updated,
      scannedSubreddits: scan.scannedSubreddits,
      stats,
      timestamp: scan.timestamp,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Reddit intelligence scan failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export const GET = withCronLogging("reddit-intelligence", handle);
export const POST = withCronLogging("reddit-intelligence", handle);
