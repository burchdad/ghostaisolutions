import { requireAdmin } from "@/lib/adminGuard";
import CaseStudyClient from "./CaseStudyClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Case Study Agent - Admin", robots: { index: false, follow: false } };

export default function AdminCaseStudyPage() {
  requireAdmin("/admin/agents/case-study");
  return <CaseStudyClient />;
}
