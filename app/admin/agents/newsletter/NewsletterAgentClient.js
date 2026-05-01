"use client";

import { useState } from "react";
import Link from "next/link";

async function apiFetch(url, options = {}) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || `Request failed (${res.status})`);
  return payload;
}

const TABS = ["Campaigns", "Subscribers", "Drip Sequences"];

export default function NewsletterAgentClient({ initialSubscribers = [], initialCampaigns = [], subStats = {}, campStats = {}, recentPosts = [] }) {
  const [tab, setTab] = useState("Campaigns");
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [drip, setDrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [dripContext, setDripContext] = useState("general AI automation for B2B operators");
  const [sendingId, setSendingId] = useState(null);

  async function handleGenerate() {
    setLoading(true); setMessage(""); setSelectedCampaign(null);
    try {
      const payload = await apiFetch("/api/agents/newsletter", { method: "POST", body: JSON.stringify({ action: "generate-digest" }) });
      setCampaigns((prev) => [payload.campaign, ...prev]);
      setSelectedCampaign(payload.campaign);
      setMessage("Weekly digest generated.");
    } catch (e) { setMessage(e.message); }
    finally { setLoading(false); }
  }

  async function handleGenerateDrip() {
    setLoading(true); setMessage(""); setDrip(null);
    try {
      const payload = await apiFetch("/api/agents/newsletter", { method: "POST", body: JSON.stringify({ action: "generate-drip", context: dripContext }) });
      setDrip(payload.sequence);
    } catch (e) { setMessage(e.message); }
    finally { setLoading(false); }
  }

  async function handleSend(campaignId) {
    if (!confirm("Send this campaign to all active subscribers?")) return;
    setSendingId(campaignId);
    try {
      const payload = await apiFetch("/api/agents/newsletter", { method: "POST", body: JSON.stringify({ action: "send-campaign", campaignId }) });
      setMessage(`Sent to ${payload.sent} subscriber(s).`);
      const refreshed = await apiFetch("/api/agents/newsletter");
      setCampaigns(refreshed.campaigns || []);
    } catch (e) { setMessage(e.message); }
    finally { setSendingId(null); }
  }

  async function handleAddSubscriber() {
    if (!newEmail.trim()) return;
    try {
      await apiFetch("/api/agents/newsletter", { method: "POST", body: JSON.stringify({ action: "add-subscriber", email: newEmail, name: newName }) });
      const refreshed = await apiFetch("/api/agents/newsletter");
      setSubscribers(refreshed.subscribers || []);
      setNewEmail(""); setNewName("");
      setMessage(`Added ${newEmail}`);
    } catch (e) { setMessage(e.message); }
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Agent Hub</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Newsletter Agent</h1>
            <p className="mt-2 text-sm text-slate-300">Your owned channel. Auto-generate weekly digests, manage subscribers, and build drip sequences.</p>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300/40 hover:text-white">← Agent Hub</Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Subscribers", value: subStats.total ?? 0 },
            { label: "Active", value: subStats.active ?? 0 },
            { label: "Campaigns Sent", value: campStats.sent ?? 0 },
            { label: "Total Sends", value: campStats.totalSent ?? 0 },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200" : "border-white/10 text-slate-400 hover:text-white"}`}>{t}</button>
          ))}
        </div>

        {message && <p className={`mb-4 text-sm ${message.includes("error") || message.includes("fail") ? "text-rose-300" : "text-emerald-300"}`}>{message}</p>}

        {/* ── Campaigns Tab ── */}
        {tab === "Campaigns" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <button onClick={handleGenerate} disabled={loading} className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">
                {loading ? "Generating digest…" : "Generate This Week&apos;s Digest"}
              </button>
              {campaigns.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No campaigns yet.</p>}
              {campaigns.map((c) => (
                <article key={c.id} onClick={() => setSelectedCampaign(c)} className={`cursor-pointer rounded-2xl border p-4 transition-colors ${selectedCampaign?.id === c.id ? "border-cyan-300/40 bg-cyan-950/20" : "border-white/10 bg-slate-950/60 hover:border-white/20"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{c.subject}</p>
                      <p className="mt-1 text-xs text-slate-400">{c.type} · {new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${c.status === "sent" ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-200" : "border-amber-300/40 bg-amber-300/15 text-amber-200"}`}>{c.status}</span>
                  </div>
                  {c.status === "draft" && (
                    <button onClick={(e) => { e.stopPropagation(); handleSend(c.id); }} disabled={sendingId === c.id} className="mt-3 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">
                      {sendingId === c.id ? "Sending…" : `Send to ${subStats.active ?? 0} subscribers`}
                    </button>
                  )}
                </article>
              ))}
            </div>

            <div className="sticky top-6 self-start">
              {selectedCampaign?.content ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">Preview</p>
                  <p className="text-lg font-bold text-white">{selectedCampaign.content.headline}</p>
                  <p className="text-sm text-slate-300">{selectedCampaign.content.intro}</p>
                  {(selectedCampaign.content.sections || []).map((s, i) => (
                    <div key={i} className="border-t border-white/10 pt-4">
                      <p className="text-sm font-semibold text-white">{s.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{s.body}</p>
                    </div>
                  ))}
                  {selectedCampaign.content.closingNote && <p className="text-xs text-slate-500 border-t border-white/10 pt-3">{selectedCampaign.content.closingNote}</p>}
                  {selectedCampaign.content.ps && <p className="text-xs text-slate-600 italic">P.S. {selectedCampaign.content.ps}</p>}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-8 text-center"><p className="text-slate-400">Click a campaign to preview it.</p></div>
              )}
            </div>
          </div>
        )}

        {/* ── Subscribers Tab ── */}
        {tab === "Subscribers" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email</label>
                <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-300/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Name</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Optional" className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-300/40 focus:outline-none" />
              </div>
              <button onClick={handleAddSubscriber} className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">Add Subscriber</button>
            </div>
            {subscribers.length === 0 && <p className="text-center text-sm text-slate-500 py-8">No subscribers yet.</p>}
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 overflow-hidden">
              {subscribers.map((s, i) => (
                <div key={s.id} className={`flex items-center justify-between gap-4 px-5 py-3 ${i > 0 ? "border-t border-white/10" : ""}`}>
                  <div>
                    <p className="text-sm font-semibold text-white">{s.email}</p>
                    {s.name && <p className="text-xs text-slate-400">{s.name}</p>}
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${s.status === "active" ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-200" : "border-slate-400/30 bg-slate-400/10 text-slate-300"}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Drip Sequences Tab ── */}
        {tab === "Drip Sequences" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Generate Drip Sequence</p>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Subscriber Context / Interest</label>
                  <textarea value={dripContext} onChange={(e) => setDripContext(e.target.value)} rows={3} className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-300/40 focus:outline-none resize-none" />
                </div>
                <button onClick={handleGenerateDrip} disabled={loading} className="w-full rounded-xl bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">
                  {loading ? "Writing sequence…" : "Generate 5-Email Drip Sequence"}
                </button>
              </div>
            </div>
            <div>
              {drip && !drip.error && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-white">{drip.name}</p>
                  {(drip.emails || []).map((e, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-cyan-300">Day {e.day} — {e.goal}</p>
                        <span className="text-[10px] text-slate-500">{e.subject}</span>
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-wrap">{e.body}</p>
                    </div>
                  ))}
                </div>
              )}
              {!drip && <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-8 text-center"><p className="text-slate-400">Generate a drip sequence to preview it here.</p></div>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
