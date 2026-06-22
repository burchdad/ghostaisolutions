"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import GhostAvatar from "@/components/GhostAvatar";
import TrackCTA from "@/components/TrackCTA";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const heroStats = [
  { label: "Live Builds", value: "8" },
  { label: "Typical Launch Window", value: "2-8 weeks" },
  { label: "Custom Fit", value: "100%" },
];

export default function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const [lowPowerMode, setLowPowerMode] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") {
      return;
    }

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = Boolean(conn?.saveData);
    const lowCpu = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
    const lowMem = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
    setLowPowerMode(saveData || lowCpu || lowMem);
  }, []);

  const reducedMotion = prefersReducedMotion || lowPowerMode;

  return (
    <section className="relative overflow-hidden border-b border-white/10 py-24 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-0 hero-grid" />
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-amber-300/18 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-amber-500/12 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: reducedMotion ? 0.05 : 0.11,
                delayChildren: 0.06,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center rounded-full border border-amber-300/45 bg-amber-300/12 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-100"
          >
            Websites, Automation, And AI Systems
          </motion.p>

          <motion.h1 variants={fadeUp} className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Websites That Build Trust, Capture Leads, And Grow With Your Business
          </motion.h1>

          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-lg text-slate-200 sm:text-xl">
            GhostAI Solutions builds modern websites, intake funnels, automations, and AI-powered systems for businesses that need a sharper digital presence and cleaner operations.
          </motion.p>

          <motion.p variants={fadeUp} className="mx-auto mt-3 max-w-3xl text-sm uppercase tracking-[0.16em] text-cyan-300/90 sm:text-base">
            Built for local businesses, founders, operators, and growing teams ready to look more credible online.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap justify-center gap-4">
            <TrackCTA
              href="/start"
              event="hero_start_website_audit"
              section="hero"
              placement="primary"
              label="Get Free Website Audit"
              className="rounded-xl bg-amber-300 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_35px_rgba(251,191,36,0.35)] transition hover:-translate-y-0.5 hover:bg-amber-200"
            >
              Get Free Website Audit
            </TrackCTA>
            <TrackCTA
              href="/work"
              event="hero_explore_solutions"
              section="hero"
              placement="secondary"
              label="See Recent Builds"
              className="rounded-xl border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-amber-300/60 hover:bg-amber-300/10"
            >
              See Recent Builds
            </TrackCTA>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            <TrackCTA
              href="/work"
              event="hero_view_case_studies"
              section="hero"
              placement="supporting"
              label="View Case Studies"
              className="font-semibold text-amber-200/95 transition hover:text-amber-100"
            >
              View Case Studies
            </TrackCTA>
            <TrackCTA
              href="/process"
              event="hero_view_process"
              section="hero"
              placement="supporting"
              label="View Process"
              className="font-semibold text-slate-200 transition hover:text-white"
            >
              View Process
            </TrackCTA>
          </motion.div>

          <motion.div variants={fadeUp} className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-cyan-300/15 bg-slate-950/70 px-4 py-3">
                <p className="text-lg font-bold text-amber-100">{stat.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-slate-300">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="mx-auto mt-6 max-w-3xl rounded-2xl border border-white/15 bg-slate-950/60 p-4 text-left sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">How We Work</p>
            <ul className="mt-2 grid gap-2 text-sm text-slate-200 sm:grid-cols-3">
              <li>Discovery call focused on business constraints</li>
              <li>Website and funnel mapped to customer action</li>
              <li>Automation tied to real operational bottlenecks</li>
            </ul>
          </motion.div>

          <motion.div
            className="mx-auto mt-10 max-w-xl sm:max-w-2xl"
            initial={
              reducedMotion
                ? { opacity: 0, y: 10 }
                : { opacity: 0, x: 420, y: -340, scale: 0.2, rotate: 18 }
            }
            animate={
              reducedMotion
                ? { opacity: 1, y: 0 }
                : {
                    opacity: [0, 1, 1],
                    x: [420, 180, 0],
                    y: [-340, -120, 0],
                    scale: [0.2, 0.62, 1],
                    rotate: [18, 7, 0],
                  }
            }
            transition={
              reducedMotion
                ? { duration: 0.34, ease: "easeOut", delay: 0.12 }
                : {
                    duration: 1.35,
                    ease: [0.2, 0.9, 0.2, 1],
                    delay: 0.2,
                    times: [0, 0.68, 1],
                  }
            }
          >
            <GhostAvatar />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
