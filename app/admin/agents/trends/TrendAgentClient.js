"use client";

import { useState } from "react";
import Link from "next/link";

function scoreBadge(score = 0) {
  if (score >= 75) return "border-emerald-300/40 bg-emerald-300/15 text-emerald-200";
  if (score >= 55) return "border-cyan-300/40 bg-cyan-300/15 text-cyan-200";
  if (score >= 40) return "border-amber-300/40 bg-amber-300/15 text-amber-200";
  return "border-slate-400/30 bg-slate-400/10 text-slate-300";
}

function sourceBadge(source = "") {
  if (source.includes("HackerNews")) return "text-orange-300";
  if (source.includes("Reddit")) return "text-rose-300";
  if (source.includes("Product Hunt")) return "text-violet-300";
  if (source.includes("Dev.to")) return "text-indigo-300";
  return "text-slate-400";
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || `Request failed (${res.status})`);
  return payload;
}

export default function TrendAgentClient({ initialStats = {}, initialTrends = [] }) {
  const [stats, setStats] = useState(initialStats);
  const [trends, setTrends] = useState(initialTrends);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");

  async function handleRefresh() {
    setLoading(true);
    setMessage("");
    try {
      const payload = await apiFetch("/api/agents/trends", { method: "POST", body: JSON.stringify({ action: "refresh" }) });
      setStats(payload.stats || {});
      setTrends(payload.trends || []);
      setMessage(`Fetched ${payload.added} new trends, updated ${payload.updated}.`);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDraft(trend) {
    setSelectedTrend(trend);
    setDraft(null);
    setDrafting(true);
    setMessage("");
    try {
      const payload = await apiFetch("/api/agents/trends", {
        method: "POST",
        body: JSON.stringify({ action: "draft", trendId: trend.id }),
      });
      setDraft(payload.draft);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setDrafting(false);
    }
  }

  const filtered = trends.filter((t) => {
    if (filter === "high") return (t.relevanceScore || 0) >= 70;
    if (filter === "undrafted") return !t.drafted;
    return true;
  });

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Agent Hub</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Trend Intelligence Agent</h1>
            <p className="mt-2 text-sm text-slate-300">Monitor trending topics across HackerNews, Reddit, Product Hunt, and Dev.to — then draft reactive posts instantly.</p>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300/40 hover:text-white">
            ← Agent Hub
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Trends", value: stats.total ?? 0 },
            { label: "Last 24h", value: stats.last24h ?? 0 },
            { label: "High Relevance", value: stats.highScore ?? 0 },
            { label: "Needs Draft", value: stats.undrafted ?? 0 },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-xl bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading ? "Fetching trends…" : "Refresh Trends"}
          </button>
          <div className="flex gap-2">
            {["all", "high", "undrafted"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                  filter === f
                    ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-200"
                    : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                {f === "all" ? "All" : f === "high" ? "High Relevance" : "Needs Draft"}
              </button>
            ))}
          </div>
          {message && (
            <p className={`text-sm ${message.toLowerCase().includes("error") || message.toLowerCase().includes("fail") ? "text-rose-300" : "text-emerald-300"}`}>
              {message}
            </p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Trend List */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-8 text-center">
                <p className="text-slate-400">{trends.length === 0 ? "No trends yet — click Refresh Trends to fetch." : "No trends match this filter."}</p>
              </div>
            )}
            {filtered.slice(0, 30).map((trend) => (
              <article
                key={trend.id}
                onClick={() => setSelectedTrend(selectedTrend?.id === trend.id ? null : trend)}
                className={`cursor-pointer rounded-2xl border p-4 transition-colors ${
                  selectedTrend?.id === trend.id
                    ? "border-cyan-300/40 bg-cyan-950/20"
                    : "border-white/10 bg-slate-950/60 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug text-white line-clamp-2">{trend.title}</p>
                    <p className={`mt-1 text-xs font-medium ${sourceBadge(trend.source)}`}>{trend.source}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${scoreBadge(trend.relevanceScore)}`}>
                      {trend.relevanceScore ?? "–"}
                    </span>
                    {trend.drafted && (
                      <span className="text-[10px] text-slate-500">drafted</span>
                    )}
                  </div>
                </div>
                {trend.description && (
                  <p className="mt-2 text-xs text-slate-400 line-clamp-2">{trend.description}</p>
                )}
                {trend.points > 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    {trend.points} points{trend.comments > 0 ? ` · ${trend.comments} comments` : ""}
                  </p>
                )}
                {selectedTrend?.id === trend.id && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDraft(trend); }}
                      disabled={drafting}
                      className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
                    >
                      {drafting ? "Drafting…" : "Draft Reactive Posts"}
                    </button>
                    <a
                      href={trend.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                    >
                      View Source ↗
                    </a>
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* Draft Panel */}
          <div className="sticky top-6 self-start">
            {!draft && !drafting && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-8 text-center">
                <p className="text-slate-400">Select a trend and click &ldquo;Draft Reactive Posts&rdquo; to generate platform-specific content.</p>
              </div>
            )}
            {drafting && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-8 text-center">
                <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
                <p className="text-sm text-slate-300">Drafting reactive posts…</p>
              </div>
            )}
            {draft && !draft.error && selectedTrend && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">Trend Angle</p>
                  <p className="mt-2 text-sm text-slate-200">{draft.angle}</p>
                  <p className="mt-1 text-xs text-slate-500">for: {selectedTrend.title}</p>
                </div>

                {[
                  { key: "linkedin", label: "LinkedIn", color: "text-blue-300" },
                  { key: "x", label: "X (Twitter)", color: "text-slate-200" },
                  { key: "facebook", label: "Facebook", color: "text-indigo-300" },
                ].map(({ key, label, color }) => draft[key] && (
                  <div key={key} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                    <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${color}`}>{label}</p>
                    <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-200 font-sans leading-relaxed">{draft[key].text}</pre>
                    <button
                      onClick={() => navigator.clipboard?.writeText(draft[key].text)}
                      className="mt-3 text-xs text-slate-400 hover:text-cyan-300"
                    >
                      Copy →
                    </button>
                  </div>
                ))}
              </div>
            )}
            {draft?.error && (
              <div className="rounded-2xl border border-rose-300/20 bg-rose-950/20 p-5">
                <p className="text-sm text-rose-300">{draft.error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
