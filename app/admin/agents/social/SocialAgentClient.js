"use client";

import Link from "next/link";
import { useState } from "react";

export default function SocialAgentClient({ queue, subagents, accountChecks, schedulerReady }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [variants, setVariants] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState(null);
  const [error, setError] = useState(null);

  const allConnected = accountChecks.every((item) => item.connected);

  const handleRepurpose = async (post) => {
    setLoading(true);
    setError(null);
    setSelectedPost(post);

    try {
      const content = post.fullPost.sections
        ?.map((section) => (typeof section === "string" ? section : section.text || section.items?.join(" ") || ""))
        .join(" ") || "";

      const response = await fetch("/api/agents/social/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to repurpose content");
      }

      const data = await response.json();
      setVariants(data.variants);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (platforms = "all") => {
    if (!variants) return;

    setPublishing(true);
    setError(null);

    try {
      const response = await fetch("/api/agents/social/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: platforms,
          linkedinContent: variants.linkedin?.text,
          xContent: variants.x?.text,
          facebookContent: variants.facebook?.text,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to publish content");
      }

      const data = await response.json();
      setPublishResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  const handleTriggerAll = async () => {
    setPublishing(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/agents/social/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to trigger full automation");
      }

      setPublishResults(payload?.processed || payload?.results || payload);
      setSelectedPost(null);
      setVariants(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Social Agent</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Master Social Agent Coordinator</h1>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200">Back to Agent Hub</Link>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-300/40 bg-red-300/10 p-4">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <div className="mb-8 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleTriggerAll}
              disabled={publishing || !allConnected || !schedulerReady}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {publishing ? "Processing..." : "Run Full Automation"}
            </button>
            <button
              onClick={() => {
                setVariants(null);
                setPublishResults(null);
                setSelectedPost(null);
              }}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
            >
              Clear Preview
            </button>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">Subagents</h2>
          <p className="mt-1 text-slate-400">Each social platform has its own specialized subagent:</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {subagents.map((agent) => (
              <Link
                key={agent.name}
                href={agent.href}
                className="group rounded-xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-cyan-300/40 hover:bg-slate-900/60"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-2xl">{agent.icon}</span>
                    <p className="mt-2 font-semibold text-white group-hover:text-cyan-300">{agent.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{agent.description}</p>
                  </div>
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] ${
                      agent.connected
                        ? "border border-emerald-300/40 bg-emerald-300/15 text-emerald-200"
                        : "border border-amber-300/40 bg-amber-300/15 text-amber-200"
                    }`}
                  >
                    {agent.connected ? "Ready" : "Setup"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">Account Access + API Status</h2>
          <div className="mt-4 space-y-3">
            {accountChecks.map((item) => (
              <article key={item.name} className="rounded-xl border border-white/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-white">{item.name}</p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] ${
                      item.connected
                        ? "border border-emerald-300/40 bg-emerald-300/15 text-emerald-200"
                        : "border border-amber-300/40 bg-amber-300/15 text-amber-200"
                    }`}
                  >
                    {item.connected ? "Connected" : "Missing"}
                  </span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">Env: {item.env}</p>
                <p className="mt-1 text-sm text-slate-300">Required scope: {item.scope}</p>
              </article>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm">
            <p className="text-slate-200">Scheduler secret: {schedulerReady ? "Ready" : "Missing"}</p>
            <p className="mt-1 text-slate-300">
              Automation status: {allConnected && schedulerReady ? "Ready to auto-publish" : "Waiting on account access"}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">
            {selectedPost && variants ? `Preview: ${selectedPost.title}` : "Repurposing Queue"}
          </h2>
          <p className="mt-1 text-slate-400">
            {selectedPost && variants ? "Review platform variants before publishing" : "Blog posts scheduled for social media distribution"}
          </p>

          {selectedPost && variants && (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-2 font-semibold text-white">💼 LinkedIn Variant</p>
                  <span className="text-xs text-slate-400">~{variants.linkedin?.text?.length} chars</span>
                </div>
                <p className="mb-3 line-clamp-6 text-sm text-slate-300">{variants.linkedin?.text}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-2 font-semibold text-white">𝕏 X (Twitter) Variant</p>
                  <span className="text-xs text-slate-400">~{variants.x?.text?.length} chars</span>
                </div>
                <p className="mb-3 line-clamp-6 text-sm text-slate-300">{variants.x?.text}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-2 font-semibold text-white">f Facebook Variant</p>
                  <span className="text-xs text-slate-400">~{variants.facebook?.text?.length} chars</span>
                </div>
                <p className="mb-3 line-clamp-6 text-sm text-slate-300">{variants.facebook?.text}</p>
              </div>

              {publishResults && (
                <div className="rounded-xl border border-emerald-300/40 bg-emerald-300/10 p-4">
                  <p className="font-semibold text-emerald-200">Publishing response received.</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => handlePublish("all")}
                  disabled={publishing}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {publishing ? "Publishing..." : "Publish to All Platforms"}
                </button>
                <button
                  onClick={() => {
                    setVariants(null);
                    setPublishResults(null);
                    setSelectedPost(null);
                  }}
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!selectedPost && (
            <div className="mt-4 space-y-3">
              {queue.length ? (
                queue.map((item) => (
                  <div key={item.slug} className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-400">{item.slug}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.channels.map((channel) => (
                            <span key={channel} className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-xs text-cyan-200">{channel}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRepurpose(item)}
                        disabled={loading}
                        className="whitespace-nowrap rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
                      >
                        {loading ? "Generating..." : "Preview"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-300">No auto posts available to repurpose yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}