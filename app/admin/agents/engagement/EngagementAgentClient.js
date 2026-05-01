"use client";

import { useState } from "react";
import Link from "next/link";

async function apiFetch(url, options = {}) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || `Request failed (${res.status})`);
  return payload;
}

const FILTERS = ["all", "pending", "drafted", "replied", "dismissed"];
const PLATFORM_COLORS = { Reddit: "border-orange-300/40 bg-orange-300/10 text-orange-200", HackerNews: "border-amber-300/40 bg-amber-300/10 text-amber-200" };

export default function EngagementAgentClient({ initialOpportunities = [], initialStats = {} }) {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [stats, setStats] = useState(initialStats);
  const [filter, setFilter] = useState("all");
  const [scanning, setScanning] = useState(false);
  const [draftingId, setDraftingId] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [message, setMessage] = useState("");

  const filtered = filter === "all" ? opportunities : opportunities.filter((o) => o.status === filter);

  async function handleScan() {
    setScanning(true); setMessage("");
    try {
      const payload = await apiFetch("/api/agents/engagement", { method: "POST", body: JSON.stringify({ action: "scan" }) });
      setOpportunities(payload.opportunities || []);
      setStats(payload.stats || {});
      setMessage(`Found ${payload.found} signals. ${payload.added} new added.`);
    } catch (e) { setMessage(e.message); }
    finally { setScanning(false); }
  }

  async function handleDraft(opp) {
    setDraftingId(opp.id);
    try {
      const payload = await apiFetch("/api/agents/engagement", { method: "POST", body: JSON.stringify({ action: "draft-reply", opportunityId: opp.id }) });
      setOpportunities((prev) => prev.map((o) => o.id === opp.id ? { ...o, status: "drafted", draftReply: payload.draft } : o));
      setExpanded(opp.id);
    } catch (e) { setMessage(e.message); }
    finally { setDraftingId(null); }
  }

  async function handleStatus(opp, status) {
    try {
      await apiFetch("/api/agents/engagement", { method: "POST", body: JSON.stringify({ action: "update-status", opportunityId: opp.id, status }) });
      setOpportunities((prev) => prev.map((o) => o.id === opp.id ? { ...o, status } : o));
    } catch (e) { setMessage(e.message); }
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Agent Hub</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Engagement Agent</h1>
            <p className="mt-2 text-sm text-slate-300">Monitor Reddit &amp; HN for relevant conversations. Draft authentic replies. Build visibility where your buyers hang out.</p>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300/40 hover:text-white">← Agent Hub</Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Total", value: stats.total ?? 0 },
            { label: "Pending", value: stats.pending ?? 0 },
            { label: "Drafted", value: stats.drafted ?? 0 },
            { label: "Replied", value: stats.replied ?? 0 },
            { label: "Dismissed", value: stats.dismissed ?? 0 },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button onClick={handleScan} disabled={scanning} className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">
            {scanning ? "Scanning…" : "Scan Now"}
          </button>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-xl border px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${filter === f ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200" : "border-white/10 text-slate-400 hover:text-white"}`}>{f}</button>
            ))}
          </div>
        </div>

        {message && <p className="mb-4 text-sm text-cyan-300">{message}</p>}

        <div className="space-y-3">
          {filtered.length === 0 && <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-8 text-center"><p className="text-slate-400">No opportunities found. Click &ldquo;Scan Now&rdquo; to search for mentions.</p></div>}
          {filtered.map((opp) => (
            <article key={opp.id} className="rounded-2xl border border-white/10 bg-slate-950/60 overflow-hidden">
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${PLATFORM_COLORS[opp.platform] || "border-slate-400/30 text-slate-300"}`}>{opp.platform}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${opp.status === "replied" ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-200" : opp.status === "drafted" ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200" : opp.status === "dismissed" ? "border-slate-400/30 text-slate-500" : "border-amber-300/40 bg-amber-300/10 text-amber-200"}`}>{opp.status}</span>
                      {opp.score > 0 && <span className="text-[10px] text-slate-500">↑ {opp.score}</span>}
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{opp.title}</p>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2">{opp.snippet}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{opp.relevanceReason}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a href={opp.sourceUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-400 hover:text-white">View</a>
                    {opp.status === "pending" && (
                      <button onClick={() => handleDraft(opp)} disabled={draftingId === opp.id} className="rounded-lg bg-cyan-500/20 border border-cyan-300/30 px-2 py-1 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-50">
                        {draftingId === opp.id ? "Drafting…" : "Draft Reply"}
                      </button>
                    )}
                    {opp.status === "drafted" && (
                      <>
                        <button onClick={() => setExpanded((p) => p === opp.id ? null : opp.id)} className="rounded-lg border border-cyan-300/30 px-2 py-1 text-xs text-cyan-200">
                          {expanded === opp.id ? "Hide" : "Preview"}
                        </button>
                        <button onClick={() => handleStatus(opp, "replied")} className="rounded-lg bg-emerald-500/20 border border-emerald-300/30 px-2 py-1 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30">Mark Replied</button>
                      </>
                    )}
                    {opp.status === "pending" && (
                      <button onClick={() => handleStatus(opp, "dismissed")} className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-500 hover:text-slate-300">Dismiss</button>
                    )}
                  </div>
                </div>
              </div>

              {expanded === opp.id && opp.draftReply && (
                <div className="border-t border-white/10 bg-slate-900/40 px-5 py-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-xs font-semibold text-cyan-300 uppercase tracking-[0.12em]">Draft Reply</span>
                    <span className="text-[10px] text-slate-500">Tone: {opp.draftReply.tone}</span>
                    <span className={`text-[10px] ${opp.draftReply.estimatedImpact === "high" ? "text-emerald-300" : opp.draftReply.estimatedImpact === "medium" ? "text-amber-300" : "text-slate-400"}`}>Impact: {opp.draftReply.estimatedImpact}</span>
                  </div>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap rounded-xl bg-slate-950/60 border border-white/10 p-4">{opp.draftReply.reply}</p>
                  {opp.draftReply.notes && <p className="text-xs text-slate-500 italic">{opp.draftReply.notes}</p>}
                  <button onClick={() => { navigator.clipboard?.writeText(opp.draftReply.reply || ""); setMessage("Copied to clipboard!"); }} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-300/40 hover:text-cyan-200">Copy Reply</button>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
