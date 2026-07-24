import Link from "next/link";
import { requireAdmin } from "@/lib/adminGuard";
import { hasRedditIntelligenceConfig } from "@/lib/redditIntelligence";
import { getRedditIntelligenceStats, listRedditOpportunities } from "@/lib/redditIntelligenceStore";
import RedditIntelligenceClient from "./RedditIntelligenceClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reddit Intelligence - Admin", robots: { index: false, follow: false } };

export default async function RedditIntelligencePage() {
  requireAdmin("/admin/agents/reddit");

  const [opportunities, stats] = await Promise.all([
    listRedditOpportunities({ limit: 100 }).catch(() => []),
    getRedditIntelligenceStats().catch(() => ({ total: 0, last24h: 0, drafted: 0, posted: 0, dismissed: 0, highIntent: 0 })),
  ]);

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Agent Hub</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Reddit Intelligence Agent</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Finds buyer-intent Reddit threads, drafts useful founder replies, and turns market questions into content and positioning signals.
            </p>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300/40 hover:text-white">
            Agent Hub
          </Link>
        </div>

        <RedditIntelligenceClient
          initialOpportunities={opportunities}
          initialStats={stats}
          configured={hasRedditIntelligenceConfig()}
          targetSubreddits={process.env.REDDIT_TARGET_SUBREDDITS || "smallbusiness,startups,Entrepreneur,SaaS,ArtificialInteligence,automation,webdev,NoCode"}
        />
      </div>
    </section>
  );
}
