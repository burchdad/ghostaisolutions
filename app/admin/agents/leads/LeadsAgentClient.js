"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const STATUS_ORDER = ["new", "qualified", "ready_outreach", "contacted", "replied", "won", "unqualified"];

function badgeClass(status) {
  if (["won", "replied"].includes(status)) return "border-emerald-300/40 bg-emerald-300/15 text-emerald-200";
  if (["contacted", "ready_outreach"].includes(status)) return "border-cyan-300/40 bg-cyan-300/15 text-cyan-200";
  if (status === "qualified") return "border-indigo-300/40 bg-indigo-300/15 text-indigo-200";
  if (status === "unqualified") return "border-rose-300/40 bg-rose-300/15 text-rose-200";
  return "border-amber-300/40 bg-amber-300/15 text-amber-200";
}

function scoreBadge(score = 0) {
  if (score >= 75) return "text-emerald-300";
  if (score >= 60) return "text-cyan-300";
  if (score >= 45) return "text-amber-300";
  return "text-slate-400";
}

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || payload?.details || `Request failed (${response.status})`);
  }
  return payload;
}

export default function LeadsAgentClient({ initialLeads = [] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [selectedId, setSelectedId] = useState(initialLeads[0]?.id || null);
  const [urlInput, setUrlInput] = useState("");
  const [manualWebsite, setManualWebsite] = useState("");
  const [manualCompany, setManualCompany] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);

  const selected = useMemo(() => leads.find((lead) => lead.id === selectedId) || null, [leads, selectedId]);

  const summary = useMemo(() => {
    const total = leads.length;
    const byStatus = leads.reduce((acc, lead) => {
      const key = lead.status || "new";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return {
      total,
      qualified: (byStatus.qualified || 0) + (byStatus.ready_outreach || 0),
      ready: byStatus.ready_outreach || 0,
      contacted: byStatus.contacted || 0,
      won: byStatus.won || 0,
    };
  }, [leads]);

  async function refreshLeads(focusLeadId = selectedId) {
    const payload = await jsonFetch("/api/admin/agents/leads");
    setLeads(payload.leads || []);
    if (focusLeadId) {
      const exists = (payload.leads || []).some((item) => item.id === focusLeadId);
      setSelectedId(exists ? focusLeadId : payload.leads?.[0]?.id || null);
    } else {
      setSelectedId(payload.leads?.[0]?.id || null);
    }
  }

  async function handleDiscover() {
    if (!urlInput.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const payload = await jsonFetch("/api/admin/agents/leads/discover", {
        method: "POST",
        body: JSON.stringify({ urlInput }),
      });
      const firstLead = payload.results?.find((item) => item.success)?.lead;
      setMessage(`Discovered ${payload.discovered} lead(s), ${payload.failed} failed.`);
      setUrlInput("");
      await refreshLeads(firstLead?.id || selectedId);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleManualAdd() {
    if (!manualCompany.trim() && !manualWebsite.trim()) return;
    setLoading(true);
    setMessage("");

    try {
      const payload = await jsonFetch("/api/admin/agents/leads", {
        method: "POST",
        body: JSON.stringify({
          companyName: manualCompany,
          website: manualWebsite,
          contactEmail: manualEmail,
          notes: manualNotes,
          sourceType: "manual",
          status: "new",
        }),
      });
      setMessage("Lead added.");
      setManualCompany("");
      setManualWebsite("");
      setManualEmail("");
      setManualNotes("");
      await refreshLeads(payload.lead?.id || selectedId);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateSelected(updates, okText = "Saved") {
    if (!selected) return;
    setSaving(true);
    setMessage("");
    try {
      const payload = await jsonFetch(`/api/admin/agents/leads/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      setLeads((current) => current.map((lead) => (lead.id === payload.lead.id ? payload.lead : lead)));
      setMessage(okText);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDraftEmail() {
    if (!selected) return;
    setDrafting(true);
    setMessage("");
    try {
      const payload = await jsonFetch(`/api/admin/agents/leads/${selected.id}/draft-email`, {
        method: "POST",
      });
      setLeads((current) => current.map((lead) => (lead.id === payload.lead.id ? payload.lead : lead)));
      setMessage("Outreach draft generated.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setDrafting(false);
    }
  }

  async function handleSendEmail() {
    if (!selected) return;
    setSending(true);
    setMessage("");
    try {
      const payload = await jsonFetch(`/api/admin/agents/leads/${selected.id}/send-email`, {
        method: "POST",
      });
      setLeads((current) => current.map((lead) => (lead.id === payload.lead.id ? payload.lead : lead)));
      setMessage("Outreach email sent via Resend.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Lead Intelligence Agent</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Discovery, Qualification, and Outreach</h1>
            <p className="mt-2 text-sm text-slate-300">Scrape business sites, score opportunities, and send personalized outreach.</p>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300/40 hover:text-white">
            Back to Agent Hub
          </Link>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
            {message}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"><p className="text-xs uppercase tracking-[0.14em] text-slate-400">Total Leads</p><p className="mt-2 text-3xl font-bold text-cyan-200">{summary.total}</p></article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"><p className="text-xs uppercase tracking-[0.14em] text-slate-400">Qualified</p><p className="mt-2 text-3xl font-bold text-cyan-200">{summary.qualified}</p></article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"><p className="text-xs uppercase tracking-[0.14em] text-slate-400">Ready Outreach</p><p className="mt-2 text-3xl font-bold text-cyan-200">{summary.ready}</p></article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"><p className="text-xs uppercase tracking-[0.14em] text-slate-400">Contacted</p><p className="mt-2 text-3xl font-bold text-cyan-200">{summary.contacted}</p></article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"><p className="text-xs uppercase tracking-[0.14em] text-slate-400">Won</p><p className="mt-2 text-3xl font-bold text-cyan-200">{summary.won}</p></article>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <h2 className="text-lg font-semibold text-white">Discover Leads from Websites</h2>
            <p className="mt-1 text-sm text-slate-400">Paste one or more domains/URLs (newline, comma, or space separated)</p>
            <textarea
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="example.com\nhttps://acme.io"
              className="mt-4 h-28 w-full rounded-xl border border-white/15 bg-slate-900/50 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50"
            />
            <button
              onClick={handleDiscover}
              disabled={loading || !urlInput.trim()}
              className="mt-3 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Discovering..." : "Run Discovery"}
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <h2 className="text-lg font-semibold text-white">Add Manual Lead</h2>
            <p className="mt-1 text-sm text-slate-400">Use this for referrals, events, and direct intros.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <input value={manualCompany} onChange={(e) => setManualCompany(e.target.value)} placeholder="Company name" className="rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50" />
              <input value={manualWebsite} onChange={(e) => setManualWebsite(e.target.value)} placeholder="Website" className="rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50" />
              <input value={manualEmail} onChange={(e) => setManualEmail(e.target.value)} placeholder="Contact email" className="rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50 sm:col-span-2" />
              <textarea value={manualNotes} onChange={(e) => setManualNotes(e.target.value)} placeholder="Notes" className="h-20 rounded-lg border border-white/15 bg-slate-900/50 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50 sm:col-span-2" />
            </div>
            <button
              onClick={handleManualAdd}
              disabled={loading || (!manualCompany.trim() && !manualWebsite.trim())}
              className="mt-3 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Lead
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <h2 className="text-lg font-semibold text-white">Lead Queue</h2>
            <p className="mt-1 text-sm text-slate-400">Prioritized by latest updates</p>

            <div className="mt-4 space-y-3 max-h-[640px] overflow-auto pr-1">
              {leads.length ? leads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => setSelectedId(lead.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${selectedId === lead.id ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/10 bg-slate-900/40 hover:border-white/20"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-white line-clamp-1">{lead.companyName}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${badgeClass(lead.status)}`}>
                      {lead.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-1">{lead.domain || lead.website || "No domain"}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <p className="text-slate-300">Score <span className={`font-semibold ${scoreBadge(lead.score?.total)}`}>{lead.score?.total ?? 0}</span></p>
                    <p className="text-slate-500">{lead.ownerName || lead.contactEmail || "No contact"}</p>
                  </div>
                </button>
              )) : (
                <p className="text-sm text-slate-400">No leads discovered yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            {selected ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{selected.companyName}</h2>
                    <p className="mt-1 text-sm text-slate-400">{selected.website || selected.domain || "No website"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] ${badgeClass(selected.status)}`}>{selected.status}</span>
                    <select
                      value={selected.status}
                      onChange={(e) => updateSelected({ status: e.target.value }, "Status updated")}
                      disabled={saving}
                      className="rounded-lg border border-white/15 bg-slate-900/60 px-2 py-1.5 text-xs text-white"
                    >
                      {STATUS_ORDER.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <article className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Total Score</p>
                    <p className={`mt-1 text-2xl font-bold ${scoreBadge(selected.score?.total)}`}>{selected.score?.total ?? 0}</p>
                  </article>
                  <article className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-400">AI Opportunity</p>
                    <p className={`mt-1 text-2xl font-bold ${scoreBadge(selected.aiOpportunity?.score)}`}>{selected.aiOpportunity?.score ?? 0}</p>
                  </article>
                  <article className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Contact</p>
                    <p className="mt-1 text-sm font-semibold text-cyan-200 line-clamp-2">{selected.ownerEmail || selected.contactEmail || "Missing"}</p>
                  </article>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Signals</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(selected.signals?.services || []).slice(0, 8).map((service) => (
                      <span key={service} className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-0.5 text-[11px] text-cyan-200">{service}</span>
                    ))}
                    {(selected.signals?.services || []).length === 0 && <span className="text-xs text-slate-500">No service signals detected.</span>}
                  </div>
                  <ul className="mt-3 space-y-1 text-xs text-slate-400">
                    <li>Has blog: {selected.signals?.hasBlog ? "yes" : "no"}</li>
                    <li>Has scheduling flow: {selected.signals?.hasScheduling ? "yes" : "no"}</li>
                    <li>Mentions AI: {selected.signals?.mentionsAI ? "yes" : "no"}</li>
                    <li>Has chat widget: {selected.signals?.hasChatWidget ? "yes" : "no"}</li>
                  </ul>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Outreach Draft</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDraftEmail}
                        disabled={drafting}
                        className="rounded-lg border border-cyan-300/40 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-300/20 disabled:opacity-50"
                      >
                        {drafting ? "Generating..." : "Generate Draft"}
                      </button>
                      <button
                        onClick={handleSendEmail}
                        disabled={sending || !selected.emailDraft?.subject || !selected.emailDraft?.body || !(selected.ownerEmail || selected.contactEmail)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {sending ? "Sending..." : "Send Email"}
                      </button>
                    </div>
                  </div>

                  {selected.emailDraft ? (
                    <>
                      <p className="mt-3 text-sm font-semibold text-white">{selected.emailDraft.subject}</p>
                      <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-white/10 bg-slate-950/60 p-3 text-xs leading-relaxed text-slate-300">
                        {selected.emailDraft.body}
                      </pre>
                      <p className="mt-2 text-[11px] text-slate-500">
                        Generated {selected.emailDraft.generatedAt ? new Date(selected.emailDraft.generatedAt).toLocaleString() : ""} via {selected.emailDraft.model || "unknown"}
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">No outreach draft yet.</p>
                  )}
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Internal Notes</p>
                  <textarea
                    defaultValue={selected.notes || ""}
                    key={`${selected.id}-notes`}
                    onBlur={(e) => {
                      const next = e.target.value;
                      if (next !== (selected.notes || "")) {
                        updateSelected({ notes: next }, "Notes saved");
                      }
                    }}
                    className="mt-2 h-24 w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>ID: {selected.id}</span>
                  <span>Created: {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "n/a"}</span>
                  <span>Updated: {selected.updatedAt ? new Date(selected.updatedAt).toLocaleDateString() : "n/a"}</span>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 text-sm text-slate-400">
                Select a lead from the queue to inspect details.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
