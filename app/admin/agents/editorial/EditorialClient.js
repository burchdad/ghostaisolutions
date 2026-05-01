"use client";

import { useState } from "react";
import Link from "next/link";

async function apiFetch(url, options = {}) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || `Request failed (${res.status})`);
  return payload;
}

const TYPE_COLORS = {
  blog: "border-cyan-300/40 bg-cyan-300/10 text-cyan-200",
  linkedin: "border-blue-300/40 bg-blue-300/10 text-blue-200",
  "x-thread": "border-slate-300/40 bg-slate-300/10 text-slate-200",
  reel: "border-pink-300/40 bg-pink-300/10 text-pink-200",
  newsletter: "border-purple-300/40 bg-purple-300/10 text-purple-200",
  "case-study": "border-emerald-300/40 bg-emerald-300/10 text-emerald-200",
};

const STAGE_DOTS = { awareness: "bg-cyan-400", consideration: "bg-amber-400", decision: "bg-emerald-400" };
const STATUS_OPTIONS = ["planned", "in-progress", "published", "skipped"];
const WEEKS = 4;

function groupByWeek(entries) {
  const weeks = [];
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  for (let w = 0; w < WEEKS; w++) {
    const weekStart = new Date(monday);
    weekStart.setDate(weekStart.getDate() + w * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const label = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    const week = entries.filter((e) => {
      const d = new Date(e.scheduledDate);
      return d >= weekStart && d <= weekEnd;
    });
    weeks.push({ label, weekStart, weekEnd, entries: week });
  }
  return weeks;
}

export default function EditorialClient({ initialEntries = [], initialThemes = [], initialStats = {} }) {
  const [entries, setEntries] = useState(initialEntries);
  const [stats, setStats] = useState(initialStats);
  const [themes] = useState(initialThemes);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [genTheme, setGenTheme] = useState("");
  const [genPillar, setGenPillar] = useState("");
  const [genWeeks, setGenWeeks] = useState(4);
  const [showForm, setShowForm] = useState(false);

  const weeks = groupByWeek(entries);

  async function handleGenerate() {
    setLoading(true); setMessage("");
    try {
      const payload = await apiFetch("/api/agents/editorial", {
        method: "POST",
        body: JSON.stringify({ action: "generate", weekCount: genWeeks, theme: genTheme || undefined, focusPillar: genPillar || undefined }),
      });
      const refreshed = await apiFetch("/api/agents/editorial");
      setEntries(refreshed.entries || []);
      setStats(refreshed.stats || {});
      setMessage(`Generated ${payload.created} entries. ${payload.summary || ""}`);
    } catch (e) { setMessage(e.message); }
    finally { setLoading(false); }
  }

  async function handleStatusChange(entry, status) {
    try {
      await apiFetch("/api/agents/editorial", { method: "POST", body: JSON.stringify({ action: "update-entry", id: entry.id, patch: { status } }) });
      setEntries((prev) => prev.map((e) => e.id === entry.id ? { ...e, status } : e));
    } catch (e) { setMessage(e.message); }
  }

  async function handleDelete(entry) {
    if (!confirm("Delete this entry?")) return;
    try {
      await apiFetch("/api/agents/editorial", { method: "POST", body: JSON.stringify({ action: "delete-entry", id: entry.id }) });
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    } catch (e) { setMessage(e.message); }
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Agent Hub</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Editorial Calendar</h1>
            <p className="mt-2 text-sm text-slate-300">AI-planned 4-week content calendar. Strategy-aware: awareness, consideration, and decision content mapped to platforms.</p>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300/40 hover:text-white">← Agent Hub</Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Planned", value: stats.total ?? 0 },
            { label: "This Week", value: stats.thisWeek ?? 0 },
            { label: "In Progress", value: stats.planned ?? 0 },
            { label: "Published", value: stats.published ?? 0 },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Generator */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">AI Planner</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Monthly Theme (optional)</label>
              <input value={genTheme} onChange={(e) => setGenTheme(e.target.value)} placeholder="e.g. AI for Revenue Teams" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-300/40 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Focus Pillar (optional)</label>
              <input value={genPillar} onChange={(e) => setGenPillar(e.target.value)} placeholder="e.g. Workflow Automation" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-300/40 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Weeks</label>
              <select value={genWeeks} onChange={(e) => setGenWeeks(Number(e.target.value))} className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-300/40 focus:outline-none">
                {[2, 3, 4, 6].map((n) => <option key={n} value={n}>{n} weeks</option>)}
              </select>
            </div>
            <button onClick={handleGenerate} disabled={loading} className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">
              {loading ? "Planning…" : "Generate Calendar"}
            </button>
          </div>
          {message && <p className="mt-3 text-sm text-cyan-300">{message}</p>}
        </div>

        {/* Legend */}
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.entries(TYPE_COLORS).map(([type, cls]) => (
            <span key={type} className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${cls}`}>{type}</span>
          ))}
          <span className="ml-2 flex items-center gap-1 text-[10px] text-slate-500"><span className="h-2 w-2 rounded-full bg-cyan-400"></span>Awareness</span>
          <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="h-2 w-2 rounded-full bg-amber-400"></span>Consideration</span>
          <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-400"></span>Decision</span>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-6">
          {weeks.map((week, wi) => (
            <div key={wi}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{week.label}</p>
              {week.entries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center"><p className="text-xs text-slate-600">No content planned this week.</p></div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {week.entries.map((entry) => (
                    <article key={entry.id} className={`rounded-2xl border bg-slate-950/60 p-4 ${entry.status === "published" ? "border-emerald-300/20" : entry.status === "skipped" ? "border-slate-400/10 opacity-60" : "border-white/10"}`}>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${TYPE_COLORS[entry.contentType] || "border-white/10 text-slate-300"}`}>{entry.contentType}</span>
                        <div className={`h-2 w-2 rounded-full ${STAGE_DOTS[entry.buyerStage] || "bg-slate-400"}`} title={entry.buyerStage}></div>
                      </div>
                      <p className="text-xs font-semibold text-white line-clamp-2">{entry.title}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{new Date(entry.scheduledDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {entry.platform}</p>
                      {entry.angle && <p className="mt-2 text-[10px] text-slate-500 line-clamp-2">{entry.angle}</p>}
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <select value={entry.status} onChange={(e) => handleStatusChange(entry, e.target.value)} className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-[10px] text-slate-300 focus:outline-none">
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={() => handleDelete(entry)} className="text-[10px] text-slate-600 hover:text-rose-400">Delete</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
