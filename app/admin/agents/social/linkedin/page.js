import Link from "next/link";
import { requireAdmin } from "@/lib/adminGuard";

export const metadata = { title: "LinkedIn Subagent — Admin", robots: { index: false, follow: false } };

export default function LinkedInSubagentPage() {
  requireAdmin("/admin/agents/social/linkedin");

  const linkedinStatus = {
    connected: Boolean(process.env.LINKEDIN_ACCESS_TOKEN),
    accountType: "Company Page",
    availableScopes: [
      "r_ads_reporting",
      "r_organization_social",
      "rw_organization_admin",
      "w_member_social",
      "r_basicprofile",
      "r_organization_admin",
    ],
  };

  const capabilities = [
    {
      title: "Organic Posts",
      description: "Post company updates, thought leadership, industry insights",
      enabled: linkedinStatus.connected,
    },
    {
      title: "Engagement Analysis",
      description: "Track likes, comments, shares, and follower growth",
      enabled: linkedinStatus.connected,
    },
    {
      title: "Organization Insights",
      description: "View organization analytics, employee engagement metrics",
      enabled: linkedinStatus.connected,
    },
    {
      title: "Member Management",
      description: "Manage team member access and posting permissions",
      enabled: linkedinStatus.connected,
    },
  ];

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <Link href="/admin/agents/social" className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 hover:text-cyan-200">
              ← Social Agent
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 mt-2">LinkedIn Subagent</p>
            <h1 className="mt-1 text-3xl font-bold text-white">LinkedIn Company Page Integration</h1>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200">
            Back to Agent Hub
          </Link>
        </div>

        {/* Connection Status */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 mb-6">
          <h2 className="text-lg font-semibold text-white">Connection Status</h2>
          <div className="mt-4">
            <div className="rounded-xl border border-white/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-white">Account: {linkedinStatus.accountType}</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] ${
                    linkedinStatus.connected
                      ? "border border-emerald-300/40 bg-emerald-300/15 text-emerald-200"
                      : "border border-amber-300/40 bg-amber-300/15 text-amber-200"
                  }`}
                >
                  {linkedinStatus.connected ? "Connected" : "Not Connected"}
                </span>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-slate-400">Environment Variable</p>
              <code className="mt-1 block text-sm text-slate-300 font-mono">LINKEDIN_ACCESS_TOKEN</code>
            </div>
          </div>
        </div>

        {/* Available Scopes */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 mb-6">
          <h2 className="text-lg font-semibold text-white">OAuth Scopes</h2>
          <div className="mt-4 space-y-2">
            {linkedinStatus.availableScopes.map((scope) => (
              <div key={scope} className="rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2">
                <p className="text-sm text-slate-200 font-mono">{scope}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform-Specific Capabilities */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">Content Optimization</h2>
          <p className="mt-2 text-slate-300">LinkedIn Subagent capabilities for repurposing content:</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {capabilities.map((cap) => (
              <article key={cap.title} className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">{cap.title}</p>
                    <p className="mt-1 text-sm text-slate-300">{cap.description}</p>
                  </div>
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] ${
                      cap.enabled
                        ? "border border-emerald-300/40 bg-emerald-300/15 text-emerald-200"
                        : "border border-slate-400/40 bg-slate-400/15 text-slate-300"
                    }`}
                  >
                    {cap.enabled ? "Ready" : "Disabled"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Content Format Guidelines */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 mt-6">
          <h2 className="text-lg font-semibold text-white">LinkedIn Format Guidelines</h2>
          <ul className="mt-4 space-y-2 text-slate-300">
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>Tone: Professional yet approachable, thought leadership focused</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>Length: 150-300 words for optimal engagement</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>Format: Hook, insight, CTA for engagement</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>Hashtags: 5-10 relevant industry hashtags</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>Call-to-action: Encourage comments and shares</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
