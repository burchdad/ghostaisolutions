"use client";

import { useState } from "react";
import Link from "next/link";

async function apiFetch(url, options = {}) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || `Request failed (${res.status})`);
  return payload;
}

const THREAT_COLORS = { high: "border-rose-300/40 bg-rose-300/10 text-rose-200", medium: "border-amber-300/40 bg-amber-300/10 text-amber-200", low: "border-emerald-300/40 bg-emerald-300/10 text-emerald-200" };

export default function CompetitorsClient({ initialCompetitors = [], initialScans = [], initialStats = {} }) {
  const [competitors, setCompetitors] = useState(initialCompetitors);
  const [scans, setScans] = useState(initialScans);
  const [stats, setStats] = useState(initialStats);
  const [scanning, setScanning] = useState(false);
  const [scanningId, setScanningId] = useState(null);
  const [expandedScan, setExpandedScan] = useState(null);
  const [message, setMessage] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", domain: "", linkedinUrl: "", twitterHandle: "", notes: "" });

  async function handleScanAll() {
    setScanning(true); setMessage("");
    try {
      const payload = await apiFetch("/api/agents/competitors", { method: "POST", body: JSON.stringify({ action: "scan" }) });
      setScans(payload.scans || []);
      setStats(payload.stats || {});
      setMessage(`Scanned ${payload.scanned} competitor(s).`);
    } catch (e) { setMessage(e.message); }
    finally { setScanning(false); }
  }

  async function handleScanOne(comp) {
    setScanningId(comp.id);
    try {
      const payload = await apiFetch("/api/agents/competitors", { method: "POST", body: JSON.stringify({ action: "scan-one", id: comp.id }) });
      setScans((prev) => [payload.scan, ...prev]);
      setExpandedScan(payload.scan?.id);
    } catch (e) { setMessage(e.message); }
    finally { setScanningId(null); }
  }

  async function handleAdd() {
    if (!addForm.name.trim() || !addForm.domain.trim()) { setMessage("Name and domain are required."); return; }
    try {
      const payload = await apiFetch("/api/agents/competitors", { method: "POST", body: JSON.stringify({ action: "add", ...addForm }) });
      setCompetitors((prev) => [...prev, payload]);
      setAddForm({ name: "", domain: "", linkedinUrl: "", twitterHandle: "", notes: "" });
      setShowAdd(false);
    } catch (e) { setMessage(e.message); }
  }

  async function handleRemove(comp) {
    if (!confirm(`Remove ${comp.name}?`)) return;
    try {
      await apiFetch("/api/agents/competitors", { method: "POST", body: JSON.stringify({ action: "remove", id: comp.id }) });
      setCompetitors((prev) => prev.filter((c) => c.id !== comp.id));
    } catch (e) { setMessage(e.message); }
  }

  const recentScans = scans.slice(0, 10);

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Agent Hub</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Competitor Intelligence</h1>
            <p className="mt-2 text-sm text-slate-300">Monitor competitors weekly. AI-synthesized differentiation opportunities delivered every Monday.</p>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300/40 hover:text-white">← Agent Hub</Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: "Tracked", value: stats.total ?? 0 },
            { label: "Total Scans", value: stats.scans ?? 0 },
            { label: "Last Scan", value: stats.lastScan ? new Date(stats.lastScan).toLocaleDateString() : "Never" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Competitor List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Tracked Competitors</p>
              <div className="flex gap-2">
                <button onClick={handleScanAll} disabled={scanning || competitors.length === 0} className="rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-40">
                  {scanning ? "Scanning…" : "Scan All"}
                </button>
                <button onClick={() => setShowAdd((p) => !p)} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-300/40 hover:text-white">+ Add</button>
              </div>
            </div>

            {showAdd && (
              <div className="rounded-2xl border border-cyan-300/20 bg-slate-950/60 p-4 space-y-3">
                {[
                  { k: "name", l: "Company Name", ph: "Acme AI" },
                  { k: "domain", l: "Domain", ph: "acme.ai" },
                  { k: "linkedinUrl", l: "LinkedIn URL (optional)", ph: "https://linkedin.com/company/…" },
                  { k: "twitterHandle", l: "X Handle (optional)", ph: "@acmeai" },
                ].map(({ k, l, ph }) => (
                  <div key={k}>
                    <label className="block text-xs text-slate-500 mb-1">{l}</label>
                    <input value={addForm[k]} onChange={(e) => setAddForm((p) => ({ ...p, [k]: e.target.value }))} placeholder={ph} className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-cyan-300/40 focus:outline-none" />
                  </div>
                ))}
                <div className="flex gap-2">
                  <button onClick={handleAdd} className="rounded-xl bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400">Save</button>
                  <button onClick={() => setShowAdd(false)} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:text-white">Cancel</button>
                </div>
              </div>
            )}

            {message && <p className="text-sm text-cyan-300">{message}</p>}

            {competitors.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center"><p className="text-xs text-slate-500">No competitors tracked yet. Click &ldquo;+ Add&rdquo; to get started.</p></div>}

            {competitors.map((comp) => (
              <div key={comp.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{comp.name}</p>
                    <a href={`https://${comp.domain}`} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-cyan-300">{comp.domain}</a>
                    {comp.lastScannedAt && <p className="text-[10px] text-slate-600 mt-1">Last scanned: {new Date(comp.lastScannedAt).toLocaleDateString()}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleScanOne(comp)} disabled={scanningId === comp.id} className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-400 hover:text-white disabled:opacity-40">{scanningId === comp.id ? "…" : "Scan"}</button>
                    <button onClick={() => handleRemove(comp)} className="rounded-lg border border-white/10 px-2 py-1 text-xs text-rose-400 hover:border-rose-400/30">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scan Results */}
          <div className="lg:col-span-3 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Recent Intelligence</p>
            {recentScans.length === 0 && <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-8 text-center"><p className="text-slate-400">No scans yet. Add competitors and click &ldquo;Scan All&rdquo;.</p></div>}
            {recentScans.map((scan) => (
              <article key={scan.id} className="rounded-2xl border border-white/10 bg-slate-950/60 overflow-hidden">
                <div
                  className="cursor-pointer p-5 flex items-start justify-between gap-3"
                  onClick={() => setExpandedScan((p) => p === scan.id ? null : scan.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-white">{scan.competitorName}</p>
                      {scan.analysis?.threatLevel && <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase ${THREAT_COLORS[scan.analysis.threatLevel] || ""}`}>{scan.analysis.threatLevel} threat</span>}
                    </div>
                    {scan.analysis?.positioningSummary && <p className="text-xs text-slate-400 line-clamp-2">{scan.analysis.positioningSummary}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-slate-500">{new Date(scan.scannedAt).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-500 mt-1">{expandedScan === scan.id ? "▲" : "▼"}</p>
                  </div>
                </div>

                {expandedScan === scan.id && scan.analysis && (
                  <div className="border-t border-white/10 bg-slate-900/40 px-5 py-4 space-y-4">
                    {scan.analysis.contentFocus && (
                      <div><p className="text-[10px] font-semibold uppercase text-slate-500 mb-1">Content Focus</p><p className="text-xs text-slate-300">{scan.analysis.contentFocus}</p></div>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {scan.analysis.apparentStrengths?.length > 0 && (
                        <div><p className="text-[10px] font-semibold uppercase text-emerald-400 mb-1">Strengths</p><ul className="space-y-0.5">{scan.analysis.apparentStrengths.map((s, i) => <li key={i} className="text-xs text-slate-300">• {s}</li>)}</ul></div>
                      )}
                      {scan.analysis.apparentWeaknesses?.length > 0 && (
                        <div><p className="text-[10px] font-semibold uppercase text-rose-400 mb-1">Weaknesses</p><ul className="space-y-0.5">{scan.analysis.apparentWeaknesses.map((s, i) => <li key={i} className="text-xs text-slate-300">• {s}</li>)}</ul></div>
                      )}
                    </div>
                    {scan.analysis.differentiationOpportunity && (
                      <div className="rounded-xl border border-cyan-300/20 bg-cyan-950/10 p-3">
                        <p className="text-[10px] font-semibold uppercase text-cyan-400 mb-1">Differentiation Opportunity</p>
                        <p className="text-xs text-slate-200">{scan.analysis.differentiationOpportunity}</p>
                      </div>
                    )}
                    {scan.analysis.actionableInsight && (
                      <div className="rounded-xl border border-amber-300/20 bg-amber-950/10 p-3">
                        <p className="text-[10px] font-semibold uppercase text-amber-400 mb-1">This Week&apos;s Action</p>
                        <p className="text-xs text-slate-200">{scan.analysis.actionableInsight}</p>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
