"use client";

import Link from "next/link";
import { useState } from "react";
import { getAllPosts } from "@/lib/allPosts";
import { requireAdmin } from "@/lib/adminGuard";

export default function AdminSocialAgentPage() {
  requireAdmin("/admin/agents/social");
  
  const allPosts = getAllPosts();
  const queue = allPosts
    .filter((post) => post.auto)
    .slice(0, 5)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || "",
      channels: ["LinkedIn", "X", "Facebook"],
      fullPost: post,
    }));

  // State management
  const [selectedPost, setSelectedPost] = useState(null);
  const [variants, setVariants] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState(null);
  const [error, setError] = useState(null);

  // Master Social Agent coordinates these subagents
  const subagents = [
    {
      name: "LinkedIn Subagent",
      href: "/admin/agents/social/linkedin",
      description: "Company page content optimizer",
      env: "LINKEDIN_ACCESS_TOKEN",
      connected: Boolean(process.env.LINKEDIN_ACCESS_TOKEN),
      icon: "💼",
    },
    {
      name: "X (Twitter) Subagent",
      href: "/admin/agents/social/x",
      description: "Corporate account tweet generator",
      env: "X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET",
      connected: Boolean(
        process.env.X_API_KEY &&
          process.env.X_API_SECRET &&
          process.env.X_ACCESS_TOKEN &&
          process.env.X_ACCESS_TOKEN_SECRET
      ),
      icon: "𝕏",
    },
    {
      name: "Facebook Subagent",
      href: "/admin/agents/social/facebook",
      description: "Business page community manager",
      env: "FACEBOOK_PAGE_ACCESS_TOKEN, FACEBOOK_PAGE_ID",
      connected: Boolean(process.env.FACEBOOK_PAGE_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID),
      icon: "f",
    },
  ];

  const accountChecks = [
    {
      name: "LinkedIn Company Page",
      env: "LINKEDIN_ACCESS_TOKEN",
      connected: Boolean(process.env.LINKEDIN_ACCESS_TOKEN),
      scope: "w_member_social, r_organization_social",
    },
    {
      name: "X (Twitter) Account",
      env: "X_API_KEY / X_API_SECRET / X_ACCESS_TOKEN / X_ACCESS_TOKEN_SECRET",
      connected: Boolean(
        process.env.X_API_KEY &&
          process.env.X_API_SECRET &&
          process.env.X_ACCESS_TOKEN &&
          process.env.X_ACCESS_TOKEN_SECRET
      ),
      scope: "Tweet create/read",
    },
    {
      name: "Facebook Page",
      env: "FACEBOOK_PAGE_ACCESS_TOKEN + FACEBOOK_PAGE_ID",
      connected: Boolean(process.env.FACEBOOK_PAGE_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID),
      scope: "pages_manage_posts, pages_read_engagement",
    },
  ];

  const schedulerReady = Boolean(process.env.SOCIAL_AGENT_CRON_SECRET);
  const allConnected = accountChecks.every((item) => item.connected);

  // Repurpose content for a post
  const handleRepurpose = async (post) => {
    setLoading(true);
    setError(null);
    setSelectedPost(post);

    try {
      const content = post.fullPost.sections
        ?.map((s) => (typeof s === "string" ? s : s.text || s.items?.join(" ") || ""))
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

  // Publish variants to platforms
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

  // Trigger full automation
  const handleTriggerAll = async () => {
    setPublishing(true);
    setError(null);

    try {
      const cronSecret = process.env.SOCIAL_AGENT_CRON_SECRET;
      if (!cronSecret) {
        throw new Error("Scheduler not configured (missing SOCIAL_AGENT_CRON_SECRET)");
      }

      const response = await fetch("/api/agents/social/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cronSecret}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to trigger full automation");
      }

      const data = await response.json();
      setPublishResults(data);
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

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-300/40 bg-red-300/10 p-4">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          <div className="mt-4 flex gap-3 flex-wrap">
            <button
              onClick={handleTriggerAll}
              disabled={publishing || !allConnected || !schedulerReady}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Subagents Grid */}
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

        {/* Account Access + API Status */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 mb-6">
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

        {/* Repurposing Queue / Preview */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold text-white">
            {selectedPost && variants ? `Preview: ${selectedPost.title}` : "Repurposing Queue"}
          </h2>
          <p className="mt-1 text-slate-400">
            {selectedPost && variants ? "Review platform variants before publishing" : "Blog posts scheduled for social media distribution"}
          </p>

          {/* Variants Preview */}
          {selectedPost && variants && (
            <div className="mt-6 space-y-4">
              {/* LinkedIn Preview */}
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-white flex items-center gap-2">💼 LinkedIn Variant</p>
                  <span className="text-xs text-slate-400">~{variants.linkedin?.text?.length} chars</span>
                </div>
                <p className="text-sm text-slate-300 mb-3 line-clamp-6">{variants.linkedin?.text}</p>
                {variants.linkedin?.tips && (
                  <div className="text-xs text-slate-400">
                    <p className="font-semibold mb-1">Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {variants.linkedin.tips.slice(0, 2).map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* X Preview */}
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-white flex items-center gap-2">𝕏 X (Twitter) Variant</p>
                  <span className="text-xs text-slate-400">~{variants.x?.text?.length} chars</span>
                </div>
                <p className="text-sm text-slate-300 mb-3 line-clamp-6">{variants.x?.text}</p>
                {variants.x?.tips && (
                  <div className="text-xs text-slate-400">
                    <p className="font-semibold mb-1">Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {variants.x.tips.slice(0, 2).map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Facebook Preview */}
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-white flex items-center gap-2">f Facebook Variant</p>
                  <span className="text-xs text-slate-400">~{variants.facebook?.text?.length} chars</span>
                </div>
                <p className="text-sm text-slate-300 mb-3 line-clamp-6">{variants.facebook?.text}</p>
                {variants.facebook?.tips && (
                  <div className="text-xs text-slate-400">
                    <p className="font-semibold mb-1">Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {variants.facebook.tips.slice(0, 2).map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Publish Results */}
              {publishResults && (
                <div className="rounded-xl border border-emerald-300/40 bg-emerald-300/10 p-4">
                  <p className="font-semibold text-emerald-200">✓ Published successfully!</p>
                  <div className="mt-2 text-xs text-emerald-200 space-y-1">
                    {publishResults.linkedin?.success && <p>• LinkedIn: Posted</p>}
                    {publishResults.x?.success && <p>• X: Tweeted</p>}
                    {publishResults.facebook?.success && <p>• Facebook: Posted</p>}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => handlePublish("all")}
                  disabled={publishing}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Queue List */}
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
                        className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50 whitespace-nowrap"
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
