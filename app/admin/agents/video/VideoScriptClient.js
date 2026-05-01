"use client";

import { useState } from "react";
import Link from "next/link";

const FORMATS = [
  { value: "reel", label: "Instagram Reel / TikTok", icon: "▶" },
  { value: "linkedin", label: "LinkedIn Video", icon: "💼" },
  { value: "youtube", label: "YouTube Short", icon: "▷" },
  { value: "podcast", label: "Podcast / Audiogram", icon: "🎙" },
];

const DURATIONS = [
  { value: "15s", label: "15 sec" },
  { value: "30s", label: "30 sec" },
  { value: "60s", label: "60 sec" },
  { value: "90s", label: "90 sec" },
];

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || `Request failed (${res.status})`);
  return payload;
}

export default function VideoScriptClient({ posts = [] }) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [format, setFormat] = useState("reel");
  const [duration, setDuration] = useState("60s");
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState(null);
  const [message, setMessage] = useState("");

  function loadPost(post) {
    setTitle(post.title);
    setExcerpt(post.excerpt);
    setContent(post.content?.slice(0, 600) || "");
    setScript(null);
    setMessage("");
  }

  async function handleGenerate() {
    if (!title.trim()) { setMessage("Title is required."); return; }
    setGenerating(true);
    setMessage("");
    setScript(null);
    try {
      const payload = await apiFetch("/api/agents/video", {
        method: "POST",
        body: JSON.stringify({ title, excerpt, content, format, duration }),
      });
      setScript(payload.script);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setGenerating(false);
    }
  }

  const fullScript = script ? `${script.hook}\n\n${script.script}\n\n${script.cta}` : "";

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Agent Hub</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Video Script Agent</h1>
            <p className="mt-2 text-sm text-slate-300">Generate short-form video scripts from your blog posts — Reels, LinkedIn Videos, YouTube Shorts, and Podcast clips.</p>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300/40 hover:text-white">
            ← Agent Hub
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Config Panel */}
          <div className="lg:col-span-2 space-y-5">
            {/* Post Quick-Load */}
            {posts.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Load from Post</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {posts.map((p) => (
                    <button
                      key={p.slug}
                      onClick={() => loadPost(p)}
                      className="w-full rounded-lg border border-white/10 px-3 py-2 text-left text-xs text-slate-300 hover:border-cyan-300/30 hover:text-white"
                    >
                      <span className="line-clamp-1">{p.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Script Options */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Script Options</p>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Topic or post title…"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-300/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Excerpt / Hook Context</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  placeholder="Brief description…"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-300/40 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2">Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {FORMATS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFormat(f.value)}
                      className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                        format === f.value
                          ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200"
                          : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                      }`}
                    >
                      <span className="mr-1">{f.icon}</span>
                      <span className="text-xs font-semibold">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2">Duration</label>
                <div className="flex gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value)}
                      className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-colors ${
                        duration === d.value
                          ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200"
                          : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full rounded-xl bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
              >
                {generating ? "Writing script…" : "Generate Script"}
              </button>

              {message && (
                <p className={`text-xs ${message.includes("required") || message.includes("error") ? "text-rose-300" : "text-emerald-300"}`}>
                  {message}
                </p>
              )}
            </div>
          </div>

          {/* Script Output */}
          <div className="lg:col-span-3 space-y-4">
            {generating && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-10 text-center">
                <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
                <p className="text-sm text-slate-300">Writing your video script…</p>
              </div>
            )}

            {!script && !generating && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-10 text-center">
                <p className="text-slate-400">Select a post or enter a topic, choose your format and duration, then click &ldquo;Generate Script&rdquo;.</p>
              </div>
            )}

            {script && !script.error && (
              <>
                {/* Hook */}
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-950/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300 mb-2">Opening Hook</p>
                  <p className="text-lg font-semibold leading-snug text-white">{script.hook}</p>
                  {script.captionText && (
                    <p className="mt-2 text-xs text-slate-400">On-screen caption: <span className="text-slate-200 font-semibold">&ldquo;{script.captionText}&rdquo;</span></p>
                  )}
                </div>

                {/* Full Script */}
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Full Script</p>
                    <button
                      onClick={() => navigator.clipboard?.writeText(fullScript)}
                      className="text-xs text-slate-400 hover:text-cyan-300"
                    >
                      Copy all →
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-slate-200 font-sans leading-relaxed">{script.script}</pre>
                </div>

                {/* CTA */}
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 mb-2">Call to Action</p>
                  <p className="text-sm font-semibold text-white">{script.cta}</p>
                </div>

                {/* Production Notes */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {script.bRollSuggestions?.length > 0 && (
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 mb-3">B-Roll Suggestions</p>
                      <ul className="space-y-1.5">
                        {script.bRollSuggestions.map((s, i) => (
                          <li key={i} className="text-sm text-slate-300 flex gap-2">
                            <span className="text-slate-500 shrink-0">{i + 1}.</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 space-y-4">
                    {script.hashtags?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 mb-2">Hashtags</p>
                        <div className="flex flex-wrap gap-1.5">
                          {script.hashtags.map((h, i) => (
                            <span key={i} className="rounded-full border border-white/10 bg-slate-900 px-2.5 py-1 text-xs text-slate-300">
                              {h.startsWith("#") ? h : `#${h}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {script.voiceNotes && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 mb-2">Voice Notes</p>
                        <p className="text-xs text-slate-400 italic">{script.voiceNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {script?.error && (
              <div className="rounded-2xl border border-rose-300/20 bg-rose-950/20 p-5">
                <p className="text-sm text-rose-300">{script.error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
