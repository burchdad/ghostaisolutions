import { requireAdmin } from "@/lib/adminGuard";
import { listCompetitorsAsync, listScansAsync, getCompetitorStatsAsync } from "@/lib/competitorStore";
import CompetitorsClient from "./CompetitorsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Competitor Intelligence - Admin", robots: { index: false, follow: false } };

export default async function AdminCompetitorsPage() {
  requireAdmin("/admin/agents/competitors");

  const [competitors, scans, stats] = await Promise.all([
    listCompetitorsAsync(),
    listScansAsync({ limit: 20 }),
    getCompetitorStatsAsync(),
  ]);

  return <CompetitorsClient initialCompetitors={competitors} initialScans={scans} initialStats={stats} />;
}
