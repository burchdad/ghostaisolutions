"use client";

import { useState } from "react";
import Link from "next/link";

async function apiFetch(url, options = {}) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || `Request failed (${res.status})`);
  return payload;
}

const INDUSTRIES = ["SaaS", "E-commerce", "Professional Services", "Healthcare", "Manufacturing", "Finance", "Real Estate", "Marketing Agency", "Other"];
const CLIENT_TYPES = ["Startup (1-10)", "SMB (10-50)", "Growth (50-200)", "Mid-Market (200-1000)", "Enterprise (1000+)"];

export default function CaseStudyClient() {
  const [form, setForm] = useState({ clientType: "", industry: "", challenge: "", approach: "", results: "", timeframe: "" });
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("case-study");
  const [copied, setCopied] = useState("");

  function setField(k, v) { setForm((prev) => ({ ...prev, [k]: v })); }

  async function handleGenerate() {
    if (!form.challenge.trim() || !form.results.trim()) { setError("Challenge and Results are required."); return; }
    setLoading(true); setError(""); setOutput(null);
    try {
      const payload = await apiFetch("/api/agents/case-study", { method: "POST", body: JSON.stringify(form) });
      setOutput(payload);
      setActiveTab("case-study");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function copyText(text, key) {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  const TABS = output ? ["case-study", "social", "testimonial-request"] : [];

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Agent Hub</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Case Study Agent</h1>
            <p className="mt-2 text-sm text-slate-300">Turn project wins into social proof. Generate full case studies, LinkedIn posts, and testimonial request emails.</p>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300/40 hover:text-white">← Agent Hub</Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Project Brief</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Client Type</label>
                  <select value={form.clientType} onChange={(e) => setField("clientType", e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-300/40 focus:outline-none">
                    <option value="">Select…</option>
                    {CLIENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Industry</label>
                  <select value={form.industry} onChange={(e) => setField("industry", e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-300/40 focus:outline-none">
                    <option value="">Select…</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              {[
                { key: "challenge", label: "The Challenge", placeholder: "What problem were they facing before working with us?", rows: 3 },
                { key: "approach", label: "Our Approach", placeholder: "What did we build or implement?", rows: 3 },
                { key: "results", label: "Results Achieved", placeholder: "Specific metrics, time saved, revenue impact, etc.", rows: 3 },
                { key: "timeframe", label: "Timeframe", placeholder: "e.g. 6 weeks to deploy, results seen in 30 days", rows: 2 },
              ].map(({ key, label, placeholder, rows }) => (
                <div key={key}>
                  <label className="block text-xs text-slate-400 mb-1">{label}</label>
                  <textarea value={form[key]} onChange={(e) => setField(key, e.target.value)} rows={rows} placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-cyan-300/40 focus:outline-none resize-none" />
                </div>
              ))}

              {error && <p className="text-sm text-rose-300">{error}</p>}

              <button onClick={handleGenerate} disabled={loading} className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">
                {loading ? "Generating case study…" : "Generate Case Study"}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="lg:col-span-3">
            {!output ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-16 text-center">
                <p className="text-sm text-slate-400">Fill in the project brief and click &ldquo;Generate Case Study&rdquo; to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Hero stat */}
                <div className="rounded-2xl border border-cyan-300/30 bg-cyan-950/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-400 mb-2">Hero Stat</p>
                  <p className="text-2xl font-bold text-white">{output.caseStudy?.heroStat}</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                  {[["case-study", "Case Study"], ["social", "Social Posts"], ["testimonial-request", "Testimonial Email"]].map(([id, label]) => (
                    <button key={id} onClick={() => setActiveTab(id)} className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${activeTab === id ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200" : "border-white/10 text-slate-400 hover:text-white"}`}>{label}</button>
                  ))}
                </div>

                {activeTab === "case-study" && output.caseStudy && (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 space-y-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-bold text-white">{output.caseStudy.title}</h2>
                      <button onClick={() => { const txt = `${output.caseStudy.title}\n\n${output.caseStudy.summary}\n\n${(output.caseStudy.sections || []).map((s) => `## ${s.heading}\n${s.body}`).join("\n\n")}\n\n${output.callToAction}`; copyText(txt, "cs"); }} className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-400 hover:text-slate-200">{copied === "cs" ? "✓ Copied" : "Copy"}</button>
                    </div>
                    <p className="text-sm text-slate-300 italic">{output.caseStudy.summary}</p>
                    {(output.caseStudy.sections || []).map((s, i) => (
                      <div key={i} className="border-t border-white/10 pt-4">
                        <p className="text-sm font-bold text-cyan-300 mb-1">{s.heading}</p>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{s.body}</p>
                      </div>
                    ))}
                    {output.caseStudy.testimonialPlaceholder && (
                      <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4">
                        <p className="text-xs font-semibold text-amber-300 mb-1">Testimonial (Draft for Client Approval)</p>
                        <p className="text-sm text-slate-300 italic">&ldquo;{output.caseStudy.testimonialPlaceholder}&rdquo;</p>
                      </div>
                    )}
                    {output.callToAction && <p className="text-sm font-semibold text-cyan-300 border-t border-white/10 pt-4">{output.callToAction}</p>}
                  </div>
                )}

                {activeTab === "social" && output.socialVariant && (
                  <div className="space-y-4">
                    {[["linkedin", "LinkedIn"], ["x", "X / Twitter"]].map(([key, label]) => (
                      <div key={key} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
                          <button onClick={() => copyText(output.socialVariant[key], key)} className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-400 hover:text-slate-200">{copied === key ? "✓ Copied" : "Copy"}</button>
                        </div>
                        <p className="text-sm text-slate-200 whitespace-pre-wrap">{output.socialVariant[key]}</p>
                        {key === "x" && <p className="mt-2 text-[10px] text-slate-500">{output.socialVariant.x?.length || 0} / 280 chars</p>}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "testimonial-request" && output.testimonialRequest && (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Testimonial Request Email</p>
                      <button onClick={() => copyText(`Subject: ${output.testimonialRequest.emailSubject}\n\n${output.testimonialRequest.emailBody}`, "email")} className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-400 hover:text-slate-200">{copied === "email" ? "✓ Copied" : "Copy Full Email"}</button>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Subject:</p>
                      <p className="text-sm font-semibold text-white">{output.testimonialRequest.emailSubject}</p>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">{output.testimonialRequest.emailBody}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
