import { NextResponse } from "next/server";
import {
  listCompetitorsAsync,
  saveScansAsync,
  updateCompetitorAsync,
  upsertCompetitorsAsync,
} from "@/lib/competitorStore";
import { discoverCompetitorWebsites, scanCompetitorWebsite } from "@/lib/competitorResearch";

export const maxDuration = 60;

function getCronSecret() {
  return process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
}

function errorScan(competitor, error) {
  return {
    competitorId: competitor.id,
    competitorName: competitor.name,
    domain: competitor.domain,
    signals: { homepage: {}, pages: [], recentPosts: [] },
    analysis: {
      positioningSummary: "Scan failed before website intelligence could be collected.",
      contentFocus: "Unavailable",
      apparentStrengths: [],
      apparentWeaknesses: ["Automated scan failed"],
      differentiationOpportunity: "Retry this competitor in the next scan cycle.",
      actionableInsight: error?.message || String(error),
      threatLevel: "medium",
      ghostAdvantagePlays: [],
    },
    error: error?.message || String(error),
  };
}

export async function GET(request) {
  const auth = request.headers.get("authorization") || "";
  const cronSecret = getCronSecret();
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    const scanLimit = Math.max(1, Math.min(10, Number(process.env.COMPETITOR_SCAN_LIMIT || 5)));
    const scanResults = [];
    const scanErrors = [];

    for (const competitor of competitors.slice(0, scanLimit)) {
      try {
        const scan = await scanCompetitorWebsite(competitor);
        scanResults.push(scan);
        await saveScansAsync([scan]);
        await updateCompetitorAsync(competitor.id, {
          lastScannedAt: new Date().toISOString(),
          lastDiscoverySource: competitor.discoverySource || competitor.lastDiscoverySource || "",
        });
      } catch (error) {
        const scan = errorScan(competitor, error);
        scanResults.push(scan);
        scanErrors.push({ domain: competitor.domain, error: scan.error });
        await saveScansAsync([scan]).catch(() => null);
      }
    }

    return NextResponse.json({
      success: true,
      discovered: discovery.competitors.length,
      added: upserted.added,
      updated: upserted.updated,
      scanned: scanResults.length,
      scanErrors,
      discoverySources: discovery.sources,
      competitors: competitors.slice(0, scanLimit).map(({ name, domain }) => ({ name, domain })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Competitor cron failed",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
