import { NextResponse } from "next/server";
import {
  listCompetitorsAsync,
  saveScansAsync,
  updateCompetitorAsync,
  upsertCompetitorsAsync,
} from "@/lib/competitorStore";
import { discoverCompetitorWebsites, scanCompetitorWebsite } from "@/lib/competitorResearch";

function getCronSecret() {
  return process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
}

export async function GET(request) {
  const auth = request.headers.get("authorization") || "";
  const cronSecret = getCronSecret();
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const discovery = await discoverCompetitorWebsites();
  const upserted = await upsertCompetitorsAsync(discovery.competitors);
  const competitors = await listCompetitorsAsync();

  if (competitors.length === 0) {
    return NextResponse.json({
      success: true,
      discovered: 0,
      added: 0,
      updated: 0,
      scanned: 0,
      message: "No competitors found from market research",
      discovery,
    });
  }

  const scanLimit = Math.max(1, Math.min(50, Number(process.env.COMPETITOR_SCAN_LIMIT || 25)));
  const scanResults = [];

  for (const competitor of competitors.slice(0, scanLimit)) {
    const scan = await scanCompetitorWebsite(competitor);
    scanResults.push(scan);
    await updateCompetitorAsync(competitor.id, {
      lastScannedAt: new Date().toISOString(),
      lastDiscoverySource: competitor.discoverySource || competitor.lastDiscoverySource || "",
    });
  }

  const saved = await saveScansAsync(scanResults);

  return NextResponse.json({
    success: true,
    discovered: discovery.competitors.length,
    added: upserted.added,
    updated: upserted.updated,
    scanned: saved.length,
    discoverySources: discovery.sources,
    competitors: competitors.slice(0, scanLimit).map(({ name, domain }) => ({ name, domain })),
    timestamp: new Date().toISOString(),
  });
}
