"use client";

import { useState } from "react";

const FILTERS = ["all", "drafted", "posted", "dismissed"];

async function apiFetch(body) {
  const response = await fetch("/api/admin/agents/reddit-intelligence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.details || payload?.error || `Request failed (${response.status})`);
  return payload;
}

function badgeClass(status) {
  if (status === "posted") return "border-emerald-300/40 bg-emerald-300/15 text-emerald-200";
  if (status === "dismissed") return "border-slate-400/30 bg-slate-400/10 text-slate-400";
  return "border-cyan-300/40 bg-cyan-300/10 text-cyan-200";
}

function scoreClass(score) {
  if (score >= 75) return "text-emerald-300";
  if (score >= 55) return "text-amber-300";
  return "text-slate-400";
}

export default function RedditIntelligenceClient({ initialOpportunities = [], initialStats = {}, configured = false, targetSubreddits = "" }) {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [stats, setStats] = useState(initialStats);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [edits, setEdits] = useState({});
  const [loading, setLoading] = useState(false);
  const [postingId, setPostingId] = useState(null);
  const [message, setMessage] = useState("");

  const filtered = filter === "all" ? opportunities : opportunities.filter((item) => item.status === filter);

  async function refresh(payload) {
    if (payload.opportunities) setOpportunities(payload.opportunities);
    if (payload.stats) setStats(payload.stats);
  }

  async function handleScan() {
    setLoading(true);
    setMessage("");
    try {
      const payload = await apiFetch({ action: "scan" });
      await refresh(payload);
      setMessage(`Found ${payload.found || 0}; added ${payload.added || 0}; updated ${payload.updated || 0}.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDismiss(id) {
    setMessage("");
    try {
      const payload = await apiFetch({ action: "dismiss", id });
      setOpportunities((prev) => prev.map((item) => (item.id === id ? payload.opportunity : item)));
      if (payload.stats) setStats(payload.stats);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handlePost(item) {
    const reply = edits[item.id] ?? item.draftReply?.reply ?? "";
    if (!reply.trim()) {
      setMessage("Reply text is required before posting.");
      return;
    }
    if (!confirm(`Post this reply to r/${item.subreddit}?`)) return;

    setPostingId(item.id);
    setMessage("");
    try {
      const payload = await apiFetch({ action: "post-reply", id: item.id, reply });
      setOpportunities((prev) => prev.map((opp) => (opp.id === item.id ? payload.opportunity : opp)));
      if (payload.stats) setStats(payload.stats);
      setMessage("Reply posted to Reddit.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPostingId(null);
    }
  }

  return (
    <>
      <div className="mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Total", stats.total || 0],
          ["Last 24h", stats.last24h || 0],
          ["Drafted", stats.drafted || 0],
          ["Posted", stats.posted || 0],
          ["Dismissed", stats.dismissed || 0],
          ["High Intent", stats.highIntent || 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Scan Controls</h2>
            <p className="mt-1 text-sm text-slate-400">Targets: {targetSubreddits}</p>
            <p className="mt-1 text-sm text-slate-400">Reddit OAuth: {configured ? "Configured" : "Missing credentials"}</p>
          </div>
          <button
            onClick={handleScan}
            disabled={loading || !configured}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Scanning..." : "Scan Reddit Now"}
          </button>
        </div>
        {message && <p className="mt-4 text-sm text-cyan-200">{message}</p>}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${
              filter === item ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200" : "border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-8 text-center">
            <p className="text-slate-400">No Reddit opportunities yet. Run a scan once credentials are configured.</p>
          </div>
        )}

        {filtered.map((item) => {
          const reply = edits[item.id] ?? item.draftReply?.reply ?? "";
          return (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-orange-300/40 bg-orange-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-orange-200">
                        r/{item.subreddit}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${badgeClass(item.status)}`}>
                        {item.status}
                      </span>
                      <span className={`text-[10px] font-semibold ${scoreClass(item.intentScore || 0)}`}>
                        Intent {item.intentScore || 0}
                      </span>
                    </div>
                    <h2 className="text-base font-semibold text-white">{item.title}</h2>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-300">{item.selfText || item.title}</p>
                    <p className="mt-2 text-xs text-slate-500">{item.relevanceReason}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-300/40 hover:text-cyan-200">
                      View Thread
                    </a>
                    <button onClick={() => setExpanded((prev) => (prev === item.id ? null : item.id))} className="rounded-lg border border-cyan-300/30 px-3 py-1.5 text-xs font-semibold text-cyan-200">
                      {expanded === item.id ? "Hide Draft" : "Review Draft"}
                    </button>
                    {item.status === "drafted" && (
                      <button onClick={() => handleDismiss(item.id)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:text-white">
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {expanded === item.id && (
                <div className="space-y-4 border-t border-white/10 bg-slate-900/40 p-5">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Pain Point</p>
                      <p className="mt-1 text-xs text-slate-300">{item.intelligence?.painPoint || "Unknown"}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Content Angle</p>
                      <p className="mt-1 text-xs text-slate-300">{item.intelligence?.suggestedContentAngle || "Unknown"}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Brand Fit</p>
                      <p className="mt-1 text-xs text-slate-300">{item.intelligence?.brandFit || "moderate"}</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">Approved Reply Draft</p>
                      <p className="text-xs text-slate-500">
                        Impact: {item.draftReply?.estimatedImpact || "medium"} | Mentions Ghost AI: {item.draftReply?.mentionsGhostAI ? "yes" : "no"}
                      </p>
                    </div>
                    <textarea
                      value={reply}
                      onChange={(event) => setEdits((prev) => ({ ...prev, [item.id]: event.target.value }))}
                      rows={8}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-100 outline-none focus:border-cyan-300/40"
                    />
                    {item.draftReply?.notes && <p className="mt-2 text-xs text-slate-500">{item.draftReply.notes}</p>}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigator.clipboard?.writeText(reply)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-300/40 hover:text-cyan-200"
                    >
                      Copy Reply
                    </button>
                    {item.status === "drafted" && (
                      <button
                        onClick={() => handlePost(item)}
                        disabled={postingId === item.id}
                        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {postingId === item.id ? "Posting..." : "Post Approved Reply"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
