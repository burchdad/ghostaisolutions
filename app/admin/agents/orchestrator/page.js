import { requireAdmin } from "@/lib/adminGuard";
import { getAdaptivePlan } from "@/lib/orchestratorEngine";
import { getOrchestratorState } from "@/lib/orchestratorStore";
import OrchestratorClient from "./OrchestratorClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orchestrator Agent - Admin", robots: { index: false, follow: false } };

export default function AdminOrchestratorPage() {
  requireAdmin("/admin/agents/orchestrator");

  const plan = getAdaptivePlan();
  const state = getOrchestratorState();

  return <OrchestratorClient initialPlan={plan} initialState={state} triggerEndpoint="/api/agents/orchestrator/trigger" />;
}
