"use client";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { emitGhostPulseBurst } from "@/lib/ghostAvatarSignals";

const CATEGORY_COPY = {
  "ai-agents": {
    headline: "Ghost AI builds agents like this for your ops stack.",
    sub: "We translate stories like these into real automation wired into your workflows — with guardrails, not guesswork.",
  },
  automation: {
    headline: "This type of automation is exactly what we build.",
    sub: "We scope, build, and hand off systems that eliminate the manual work described above. Fixed-fee, no retainer.",
  },
  tools: {
    headline: "We evaluate and integrate these tools for growth teams.",
    sub: "Not sure which tools are worth it? We assess, connect, and own the implementation so you don't have to.",
  },
  strategy: {
    headline: "Turn insights like these into a 90-day build plan.",
    sub: "We translate AI trends into actionable systems scoped to your revenue model and team size.",
  },
};

export default function BlogServiceCTA({ category = "ai-agents" }) {
  const msg = CATEGORY_COPY[category] ?? CATEGORY_COPY["ai-agents"];

  function handleClick(label, href) {
    track("blog_inline_cta", { label, category });
    if (typeof emitGhostPulseBurst === "function") emitGhostPulseBurst();
    window.location.href = href;
  }

  return (
    <aside className="my-10 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-6">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-2">
        From Ghost AI Solutions
      </p>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
        {msg.headline}
      </h3>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {msg.sub}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={() => handleClick("Get a Free Blueprint", "/contact#blueprint")}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Get a Free Blueprint
        </button>
        <button
          onClick={() => handleClick("See Our Work", "/work")}
          className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition-colors"
        >
          See Our Work →
        </button>
      </div>
    </aside>
  );
}
