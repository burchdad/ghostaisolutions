"use client";

import { useState } from "react";
import Link from "next/link";

async function apiFetch(url, options = {}) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || `Request failed (${res.status})`);
  return payload;
}

export default function ThreadAgentClient({ posts = [] }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tweetCount, setTweetCount] = useState(10);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  async function handleGenerate() {
    if (!selectedPost) return;
    setLoading(true); setMessage(""); setThread(null);
    try {
      const payload = await apiFetch("/api/agents/thread", {
        method: "POST",
        body: JSON.stringify({ title: selectedPost.title, excerpt: selectedPost.excerpt, content: selectedPost.content, tweetCount }),
      });
      setThread(payload.thread);
    } catch (e) { setMessage(e.message); }
    finally { setLoading(false); }
  }

  function copyAll() {
    if (!thread?.tweets) return;
    const full = thread.tweets.map((t) => `${t.number}/${thread.tweets.length} ${t.text}`).join("\n\n");
    navigator.clipboard?.writeText(full);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  function copyTweet(tweet, idx) {
    navigator.clipboard?.writeText(tweet.text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  const charWarning = (text) => text?.length > 270;

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Agent Hub</p>
            <h1 className="mt-1 text-3xl font-bold text-white">X Thread Agent</h1>
            <p className="mt-2 text-sm text-slate-300">Transform blog posts into scroll-stopping Twitter/X threads with a hook that demands attention.</p>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300/40 hover:text-white">← Agent Hub</Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Config Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Source Post</p>
              <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                {posts.map((p) => (
                  <button key={p.slug} onClick={() => setSelectedPost(p)} className={`w-full text-left rounded-xl border px-3 py-2.5 transition-colors ${selectedPost?.slug === p.slug ? "border-cyan-300/40 bg-cyan-950/20 text-white" : "border-white/10 text-slate-300 hover:border-white/20 hover:text-white"}`}>
                    <p className="text-xs font-semibold truncate">{p.title}</p>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2">Tweet Count</label>
                <div className="flex gap-2">
                  {[7, 10, 12, 15].map((n) => (
                    <button key={n} onClick={() => setTweetCount(n)} className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${tweetCount === n ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200" : "border-white/10 text-slate-400 hover:text-white"}`}>{n}</button>
                  ))}
                </div>
              </div>

              <button onClick={handleGenerate} disabled={!selectedPost || loading} className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-40">
                {loading ? "Generating thread…" : "Generate Thread"}
              </button>

              {message && <p className="text-sm text-rose-300">{message}</p>}
            </div>

            {thread && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Thread Intel</p>
                <div className="space-y-2">
                  <p className="text-xs text-slate-300"><span className="text-slate-500">Angle:</span> {thread.threadAngle}</p>
                  <p className="text-xs text-slate-300"><span className="text-slate-500">Est. Reach:</span> <span className={thread.estimatedReach === "high" ? "text-emerald-300" : thread.estimatedReach === "medium" ? "text-amber-300" : "text-slate-400"}>{thread.estimatedReach}</span></p>
                  <p className="text-xs text-slate-300"><span className="text-slate-500">Best time:</span> {thread.bestTimeToPost}</p>
                </div>
              </div>
            )}
          </div>

          {/* Thread Output */}
          <div className="lg:col-span-3">
            {thread?.tweets ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{thread.tweets.length}-tweet thread</p>
                  <button onClick={copyAll} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-300/40 hover:text-cyan-200">
                    {copiedAll ? "Copied!" : "Copy Full Thread"}
                  </button>
                </div>

                {thread.tweets.map((tweet, i) => (
                  <div key={i} className={`rounded-2xl border p-4 ${tweet.type === "hook" ? "border-cyan-300/30 bg-cyan-950/10" : "border-white/10 bg-slate-950/60"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500">{tweet.number}/{thread.tweets.length}</span>
                          {tweet.type === "hook" && <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-cyan-200">Hook</span>}
                          {tweet.type === "cta" && <span className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-200">CTA</span>}
                        </div>
                        <p className={`text-sm whitespace-pre-wrap ${tweet.type === "hook" ? "text-white font-medium" : "text-slate-200"}`}>{tweet.text}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`text-[10px] mb-1 ${charWarning(tweet.text) ? "text-rose-400" : "text-slate-500"}`}>{tweet.text?.length || 0}</p>
                        <button onClick={() => copyTweet(tweet, i)} className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200">
                          {copiedIdx === i ? "✓" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-16 text-center">
                <p className="text-sm text-slate-400">Select a blog post and click &ldquo;Generate Thread&rdquo;</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
