import { requireAdmin } from "@/lib/adminGuard";
import { listOpportunities, getEngagementStats } from "@/lib/engagementStore";
import EngagementAgentClient from "./EngagementAgentClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Engagement Agent - Admin", robots: { index: false, follow: false } };

export default function AdminEngagementPage() {
  requireAdmin("/admin/agents/engagement");

  const opportunities = listOpportunities();
  const stats = getEngagementStats();

  return <EngagementAgentClient initialOpportunities={opportunities} initialStats={stats} />;
}
