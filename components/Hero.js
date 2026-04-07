"use client";

import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import { siteConfig } from "@/lib/siteConfig";
import TrackCTA from "@/components/TrackCTA";
import useCampaignContext from "@/components/useCampaignContext";

export default function Hero(){
  const [variant, setVariant] = useState("control");
  const { campaignType, campaignCopy } = useCampaignContext();

  useEffect(() => {
    let chosen = "control";
    try {
      const stored = localStorage.getItem("ghost_hero_variant");
      if (stored === "control" || stored === "challenger") {
        chosen = stored;
      } else {
        chosen = Math.random() < 0.5 ? "control" : "challenger";
        localStorage.setItem("ghost_hero_variant", chosen);
      }
    } catch {
      chosen = "control";
    }

    setVariant(chosen);
    track("experiment_exposure", {
      experiment: "hero_value_prop_v1",
      variant: chosen,
    });
  }, []);

  const copy = useMemo(() => {
    if (variant === "challenger") {
      return {
        headlineTop: "Turn your busiest workflows",
        headlineBottom: "into autonomous revenue systems.",
        subhead:
          "Ghost deploys AI operators that handle lead response, qualification, and ops execution around the clock, with human controls where it matters.",
      };
    }

    return {
      headlineTop: "Build an AI workforce",
      headlineBottom: "that never drops the ball.",
      subhead:
        "Ghost designs and deploys revenue-facing AI agents for lead response, inbox triage, and operational execution, with governance wired in from day one.",
    };
  }, [variant]);

  return (
    <section className="relative overflow-hidden gradient-hero text-white" data-track-section="hero">
      <div className="absolute inset-0 noise-grid pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div className="animate-rise">
            <p className="inline-flex items-center rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              AI OPERATIONS STUDIO
            </p>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-6xl xl:text-7xl">
              {copy.headlineTop}
              <span className="block text-cyan-300">{copy.headlineBottom}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-200">
              {copy.subhead}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <TrackCTA
                href={siteConfig.calendlyUrl}
                event="hero_book_strategy_call"
                section="hero"
                placement={`primary_${campaignType}`}
                label="Start a Project"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.35)] transition hover:bg-cyan-300"
              >
                Start a Project
              </TrackCTA>
              <TrackCTA
                href="/demo"
                event="hero_open_demo"
                section="hero"
                placement={`secondary_${campaignType}`}
                label={campaignCopy.secondaryCta}
                className="inline-flex items-center gap-2 rounded-xl border border-white/35 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                {campaignCopy.secondaryCta}
              </TrackCTA>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat k="Launch window" v="14-30 days" />
              <Stat k="Coverage" v="24/7" />
              <Stat k="Integration" v="CRM + Inbox" />
              <Stat k="Control" v="Human approval" />
            </div>
          </div>
          <HeroPanel />
        </div>

        <Marquee />
      </div>
    </section>
  );
}

function Stat({k,v}){
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
      <p className="text-xl font-black sm:text-2xl">{v}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-300">{k}</p>
    </div>
  );
}

function HeroPanel(){
  const agents = [
    ["Lead Qualifier", "62 high-intent leads ranked", "High"],
    ["Inbox Copilot", "97% first-response SLA hit", "Stable"],
    ["Ops Reconciler", "134 records auto-resolved", "Healthy"],
    ["KPI Agent", "Pipeline dashboard refreshed", "Live"],
  ];

  return (
    <div className="animate-rise-delay">
      <div className="glass-panel rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-cyan-300">Command Feed</p>
          <span className="inline-flex items-center gap-2 text-xs text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
            Online
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {agents.map(([name, status, level]) => (
            <div key={name} className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{name}</p>
                <span className="text-xs uppercase tracking-[0.15em] text-cyan-200">{level}</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{status}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-cyan-300/25 bg-cyan-300/10 p-4 text-sm text-cyan-100">
          <p className="font-semibold">Deployment note</p>
          <p className="mt-1">Your first workflow ships with approval gates, fallback logic, and audit logging.</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-slate-300">
          <span className="rounded-lg border border-white/10 px-3 py-2">HubSpot</span>
          <span className="rounded-lg border border-white/10 px-3 py-2">Salesforce</span>
          <span className="rounded-lg border border-white/10 px-3 py-2">Gmail + Outlook</span>
          <span className="rounded-lg border border-white/10 px-3 py-2">Slack + Teams</span>
        </div>
      </div>
    </div>
  );
}

function Marquee(){
  const brands=['Ghost CRM','Ghost Investor AI','Piddy Microservices','Ghost Voice OS','TLDR Agent Demo','Content Scrapper'];
  return (
    <div className="mt-16">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Built and tested across your ecosystem</p>
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-200 sm:grid-cols-3 lg:grid-cols-6">
        {brands.map((b) => (
          <div key={b} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center backdrop-blur-sm">{b}</div>
        ))}
      </div>
    </div>
  );
}
