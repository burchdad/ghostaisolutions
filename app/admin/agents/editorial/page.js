import { requireAdmin } from "@/lib/adminGuard";
import { listCalendarEntries, listThemes, getCalendarStats } from "@/lib/editorialStore";
import EditorialClient from "./EditorialClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editorial Calendar - Admin", robots: { index: false, follow: false } };

export default function AdminEditorialPage() {
  requireAdmin("/admin/agents/editorial");

  const entries = listCalendarEntries();
  const themes = listThemes();
  const stats = getCalendarStats();

  return <EditorialClient initialEntries={entries} initialThemes={themes} initialStats={stats} />;
}
