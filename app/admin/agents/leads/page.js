import { requireAdmin } from "@/lib/adminGuard";
import { listLeads } from "@/lib/leadsStore";
import LeadsAgentClient from "./LeadsAgentClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lead Intelligence Agent - Admin", robots: { index: false, follow: false } };

export default async function AdminLeadsAgentPage() {
  requireAdmin("/admin/agents/leads");

  const leads = await listLeads().catch(() => []);

  return <LeadsAgentClient initialLeads={leads} />;
}
