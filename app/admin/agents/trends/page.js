import { requireAdmin } from "@/lib/adminGuard";
import { getTrendStats, listTrends } from "@/lib/trendStore";
import TrendAgentClient from "./TrendAgentClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Trend Intelligence Agent - Admin",
  robots: { index: false, follow: false },
};

export default function AdminTrendAgentPage() {
  requireAdmin("/admin/agents/trends");

  const stats = getTrendStats();
  const trends = listTrends().slice(0, 80);

  return <TrendAgentClient initialStats={stats} initialTrends={trends} />;
}
