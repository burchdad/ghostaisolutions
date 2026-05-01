"use client";

import { useState } from "react";
import Link from "next/link";

const STYLES = [
  { value: "editorial", label: "Editorial", desc: "Dark gradient, glowing cyan/indigo accents" },
  { value: "tech", label: "Tech Abstract", desc: "Circuit board patterns, navy and electric blue" },
  { value: "minimal", label: "Minimal", desc: "Clean white/slate, Swiss design aesthetic" },
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

export default function ImageGenClient({ initialImages = [], posts = [] }) {
  const [images, setImages] = useState(initialImages);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [slug, setSlug] = useState("");
  const [style, setStyle] = useState("editorial");
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [latestUrl, setLatestUrl] = useState(null);

  function loadPost(post) {
    setTitle(post.title);
    setExcerpt(post.excerpt);
    setSlug(post.slug);
    setLatestUrl(null);
    setMessage("");
  }

  async function handleGenerate() {
    if (!title.trim()) { setMessage("Title is required."); return; }
    setGenerating(true);
    setMessage("");
    setLatestUrl(null);
    try {
      const payload = await apiFetch("/api/agents/image-gen", {
        method: "POST",
        body: JSON.stringify({ title, excerpt, slug, style }),
      });
      setLatestUrl(payload.url);
      setMessage("Image generated successfully.");
      // Refresh image list
      const refreshed = await apiFetch("/api/agents/image-gen");
      setImages(refreshed.images || []);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Agent Hub</p>
            <h1 className="mt-1 text-3xl font-bold text-white">AI Image Generator</h1>
            <p className="mt-2 text-sm text-slate-300">Generate DALL-E 3 cover images for blog posts and social media. Images are served from <code className="text-cyan-300">/generated/</code></p>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300/40 hover:text-white">
            ← Agent Hub
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-1 space-y-5">
            {/* Post Quick-Load */}
            {posts.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Load from Post</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {posts.map((p) => (
                    <button
                      key={p.slug}
                      onClick={() => loadPost(p)}
                      className="w-full rounded-lg border border-white/10 px-3 py-2 text-left text-xs text-slate-300 hover:border-cyan-300/30 hover:text-white flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{p.title}</span>
                      {p.hasImage && <span className="shrink-0 text-emerald-400">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Generator Form */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Generate Image</p>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post or social title…"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-300/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Excerpt / Context</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  placeholder="Short description for context…"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-300/40 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Filename Slug (optional)</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="my-post-slug"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-300/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2">Style</label>
                <div className="space-y-2">
                  {STYLES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStyle(s.value)}
                      className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${
                        style === s.value
                          ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200"
                          : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                      }`}
                    >
                      <p className="text-xs font-semibold">{s.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full rounded-xl bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
              >
                {generating ? "Generating image…" : "Generate with DALL-E 3"}
              </button>

              {message && (
                <p className={`text-xs ${message.includes("success") ? "text-emerald-300" : "text-rose-300"}`}>
                  {message}
                </p>
              )}
            </div>
          </div>

          {/* Preview + Gallery */}
          <div className="lg:col-span-2 space-y-6">
            {latestUrl && (
              <div className="rounded-2xl border border-cyan-300/20 bg-slate-950/60 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">Latest Generated</p>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={latestUrl} alt="Generated cover" className="h-full w-full object-cover" />
                </div>
                <p className="mt-2 text-xs text-slate-500 font-mono">{latestUrl}</p>
                <a
                  href={latestUrl}
                  download
                  className="mt-2 inline-block text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  Download →
                </a>
              </div>
            )}

            {/* Gallery */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Generated Library ({images.length})
              </p>
              {images.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No images yet — generate your first one above.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((img) => (
                    <div key={img.filename} className="group relative aspect-video overflow-hidden rounded-xl border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.filename} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-black/80 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate w-full">{img.filename}</p>
                        <p className="text-[10px] text-slate-400">{img.sizeKb}kb</p>
                        <a href={img.url} download className="mt-1 text-[10px] font-semibold text-cyan-300">Download</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
