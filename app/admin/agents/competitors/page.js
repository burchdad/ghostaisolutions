import { requireAdmin } from "@/lib/adminGuard";
import { listCompetitors, listScans, getCompetitorStats } from "@/lib/competitorStore";
import CompetitorsClient from "./CompetitorsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Competitor Intelligence - Admin", robots: { index: false, follow: false } };

export default function AdminCompetitorsPage() {
  requireAdmin("/admin/agents/competitors");

  const competitors = listCompetitors();
  const scans = listScans({ limit: 20 });
  const stats = getCompetitorStats();

  return <CompetitorsClient initialCompetitors={competitors} initialScans={scans} initialStats={stats} />;
}
