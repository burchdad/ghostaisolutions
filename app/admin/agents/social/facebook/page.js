import Link from "next/link";
import { requireAdmin } from "@/lib/adminGuard";

export const metadata = { title: "Facebook Subagent — Admin", robots: { index: false, follow: false } };

export default function FacebookSubagentPage() {
  requireAdmin("/admin/agents/social/facebook");

  const facebookStatus = {
    connected: Boolean(process.env.FACEBOOK_PAGE_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID),
    accountType: "Business Page",
    requiredEnvVars: [
      "FACEBOOK_PAGE_ACCESS_TOKEN",
      "FACEBOOK_PAGE_ID",
    ],
    availableScopes: [
      "pages_manage_posts",
      "pages_read_engagement",
      "pages_manage_metadata",
      "pages_read_user_content",
    ],
  };

  const capabilities = [
    {
      title: "Page Posts",
      description: "Publish articles, images, videos, and links to business page",
      enabled: facebookStatus.connected,
    },
    {
      title: "Engagement Insights",
      description: "Track page likes, post reactions, shares, and reach metrics",
      enabled: facebookStatus.connected,
    },
    {
      title: "Community Management",
      description: "Monitor comments and manage audience interaction",
      enabled: facebookStatus.connected,
    },
    {
      title: "Page Analytics",
      description: "View page performance, audience demographics, best times to post",
      enabled: facebookStatus.connected,
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 mt-2">Facebook Subagent</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Facebook Business Page Integration</h1>
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
                <p className="font-semibold text-white">Account: {facebookStatus.accountType}</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] ${
                    facebookStatus.connected
                      ? "border border-emerald-300/40 bg-emerald-300/15 text-emerald-200"
                      : "border border-amber-300/40 bg-amber-300/15 text-amber-200"
                  }`}
                >
                  {facebookStatus.connected ? "Connected" : "Not Connected"}
                </span>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-slate-400">Required Environment Variables</p>
              <div className="mt-2 space-y-1">
                {facebookStatus.requiredEnvVars.map((env) => (
                  <code key={env} className="block text-sm text-slate-300 font-mono">{env}</code>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Available Scopes */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 mb-6">
          <h2 className="text-lg font-semibold text-white">OAuth Scopes</h2>
          <div className="mt-4 space-y-2">
            {facebookStatus.availableScopes.map((scope) => (
              <div key={scope} className="rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2">
                <p className="text-sm text-slate-200 font-mono">{scope}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform-Specific Capabilities */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">Content Optimization</h2>
          <p className="mt-2 text-slate-300">Facebook Subagent capabilities for repurposing content:</p>
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
          <h2 className="text-lg font-semibold text-white">Facebook Format Guidelines</h2>
          <ul className="mt-4 space-y-2 text-slate-300">
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>Tone: Community-focused, friendly, accessible to general audience</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>Length: 50-200 characters for text, extended description optional</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>Format: Strong visual (image/video) + caption + CTA</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>Hashtags: 1-3 brand/campaign hashtags</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>Call-to-action: Like, Share, Learn more, URL link</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>Media: High-quality images (1200x628) or engaging video content</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
