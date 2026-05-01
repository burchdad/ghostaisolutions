import { requireAdmin } from "@/lib/adminGuard";
import { listSubscribers, listCampaigns, getSubscriberStats, getCampaignStats } from "@/lib/newsletterStore";
import { getAllPosts } from "@/lib/allPosts";
import NewsletterAgentClient from "./NewsletterAgentClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Newsletter Agent - Admin", robots: { index: false, follow: false } };

export default function AdminNewsletterPage() {
  requireAdmin("/admin/agents/newsletter");

  const subscribers = listSubscribers();
  const campaigns = listCampaigns();
  const subStats = getSubscriberStats();
  const campStats = getCampaignStats();
  const recentPosts = getAllPosts().slice(0, 5).map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt || "" }));

  return (
    <NewsletterAgentClient
      initialSubscribers={subscribers}
      initialCampaigns={campaigns}
      subStats={subStats}
      campStats={campStats}
      recentPosts={recentPosts}
    />
  );
}
