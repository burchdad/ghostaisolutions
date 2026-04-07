import Link from "next/link";
import { requireAdmin } from "@/lib/adminGuard";

export const metadata = { title: "X Subagent — Admin", robots: { index: false, follow: false } };

export default function XSubagentPage() {
  requireAdmin("/admin/agents/social/x");

  const xStatus = {
    connected: Boolean(
      process.env.X_API_KEY &&
      process.env.X_API_SECRET &&
      process.env.X_ACCESS_TOKEN &&
      process.env.X_ACCESS_TOKEN_SECRET
    ),
    accountType: "Corporate Account",
    requiredEnvVars: [
      "X_API_KEY",
      "X_API_SECRET",
      "X_ACCESS_TOKEN",
      "X_ACCESS_TOKEN_SECRET",
    ],
  };

  const capabilities = [
    {
      title: "Tweet Publishing",
      description: "Post and schedule tweets with images, links, and threading",
      enabled: xStatus.connected,
    },
    {
      title: "Thread Creation",
      description: "Create connected tweet threads for long-form content",
      enabled: xStatus.connected,
    },
    {
      title: "Engagement Tracking",
      description: "Monitor likes, retweets, replies, and engagement metrics",
      enabled: xStatus.connected,
    },
    {
      title: "Trend Analysis",
      description: "Identify trending topics and relevant hashtags",
      enabled: xStatus.connected,
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 mt-2">X (Twitter) Subagent</p>
            <h1 className="mt-1 text-3xl font-bold text-white">X Corporate Account Integration</h1>
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
                <p className="font-semibold text-white">Account: {xStatus.accountType}</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] ${
                    xStatus.connected
                      ? "border border-emerald-300/40 bg-emerald-300/15 text-emerald-200"
                      : "border border-amber-300/40 bg-amber-300/15 text-amber-200"
                  }`}
                >
                  {xStatus.connected ? "Connected" : "Not Connected"}
                </span>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-slate-400">Required Environment Variables</p>
              <div className="mt-2 space-y-1">
                {xStatus.requiredEnvVars.map((env) => (
                  <code key={env} className="block text-sm text-slate-300 font-mono">{env}</code>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* API Version & Limitations */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 mb-6">
          <h2 className="text-lg font-semibold text-white">API Access</h2>
          <div className="mt-4 space-y-2">
            <div className="rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">API Version</p>
              <p className="text-sm text-slate-200 font-mono">X API v2 (v1.1 legacy)</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Access Level</p>
              <p className="text-sm text-slate-200">OAuth 1.0a with Read/Write permissions</p>
            </div>
          </div>
        </div>

        {/* Platform-Specific Capabilities */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">Content Optimization</h2>
          <p className="mt-2 text-slate-300">X Subagent capabilities for repurposing content:</p>
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
          <h2 className="text-lg font-semibold text-white">X Format Guidelines</h2>
          <ul className="mt-4 space-y-2 text-slate-300">
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>Tone: Sharp, conversational, authentic, industry-aware</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>Length: 240-280 characters for maximum readability</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>Format: Hook/insight, context, CTA (link or action)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>Hashtags: 2-3 trending or niche hashtags maximum</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>Threading: Break complex ideas into 5-7 tweet threads</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-300">•</span>
              <span>Call-to-action: Ask questions, invite discussion, include links</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
