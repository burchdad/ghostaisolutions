import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminSession";
import {
  getCompetitorStatsAsync,
  listCompetitorsAsync,
  listScansAsync,
  removeCompetitorAsync,
  saveScansAsync,
  updateCompetitorAsync,
  upsertCompetitorsAsync,
} from "@/lib/competitorStore";
import { discoverCompetitorWebsites, scanCompetitorWebsite } from "@/lib/competitorResearch";

function ensureAdmin() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value || "";
  return verifyAdminSessionToken(token);
}

async function scanCompetitors(competitors) {
  const scanResults = [];
  for (const comp of competitors) {
    const scan = await scanCompetitorWebsite(comp);
    scanResults.push(scan);
    await updateCompetitorAsync(comp.id, { lastScannedAt: new Date().toISOString() });
  }
  const scans = await saveScansAsync(scanResults);
  const stats = await getCompetitorStatsAsync();
  return { scans, stats };
}

export async function GET() {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [competitors, scans, stats] = await Promise.all([
    listCompetitorsAsync(),
    listScansAsync({ limit: 20 }),
    getCompetitorStatsAsync(),
  ]);

  return NextResponse.json({ competitors, scans, stats });
}

export async function POST(request) {
  if (!ensureAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { action } = body;

  if (action === "add") {
    const { name, domain, linkedinUrl, twitterHandle, notes } = body;
    if (!name || !domain) return NextResponse.json({ error: "name and domain required" }, { status: 400 });
    const result = await upsertCompetitorsAsync([{ name, domain, linkedinUrl, twitterHandle, notes, discoverySource: "manual" }]);
    return NextResponse.json({ competitor: result.competitors[0], created: result.added > 0 });
  }

  if (action === "remove") {
    await removeCompetitorAsync(body.id);
    return NextResponse.json({ success: true });
  }

  if (action === "discover") {
    const discovery = await discoverCompetitorWebsites();
    const upserted = await upsertCompetitorsAsync(discovery.competitors);
    const [competitors, stats] = await Promise.all([listCompetitorsAsync(), getCompetitorStatsAsync()]);
    return NextResponse.json({ success: true, discovery, added: upserted.added, updated: upserted.updated, competitors, stats });
  }

  if (action === "scan") {
    const discovery = await discoverCompetitorWebsites();
    const upserted = await upsertCompetitorsAsync(discovery.competitors);
    const competitors = await listCompetitorsAsync();
    if (competitors.length === 0) return NextResponse.json({ error: "No competitors available for scanning" }, { status: 400 });

    const { scans, stats } = await scanCompetitors(competitors);
    return NextResponse.json({
      success: true,
      discovered: discovery.competitors.length,
      added: upserted.added,
      updated: upserted.updated,
      scanned: scans.length,
      competitors,
      scans,
      stats,
    });
  }

  if (action === "scan-one") {
    const comp = (await listCompetitorsAsync()).find((c) => c.id === body.id);
    if (!comp) return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    const scan = await scanCompetitorWebsite(comp);
    const saved = await saveScansAsync([scan]);
    await updateCompetitorAsync(comp.id, { lastScannedAt: new Date().toISOString() });
    return NextResponse.json({ success: true, scan: saved[0] });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
