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
  { label: "Implementation Window", value: "2-8 weeks" },
  { label: "Manual Throughput Gains", value: "30-70%" },
  { label: "Custom Architecture", value: "100%" },
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
            Premium AI Transformation Consultancy
          </motion.p>

          <motion.h1 variants={fadeUp} className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Custom AI Infrastructure Built To Scale Revenue, Operations, and Decision-Making
          </motion.h1>

          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-lg text-slate-200 sm:text-xl">
            We design and deploy custom AI systems for businesses that have outgrown off-the-shelf software and need technology built around how they actually operate.
          </motion.p>

          <motion.p variants={fadeUp} className="mx-auto mt-3 max-w-3xl text-sm uppercase tracking-[0.16em] text-cyan-300/90 sm:text-base">
            Built for founders, operators, and executive teams scaling complex organizations.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap justify-center gap-4">
            <TrackCTA
              href="/contact"
              event="hero_book_strategy_call"
              section="hero"
              placement="primary"
              label="Book Strategy Call"
              className="rounded-xl bg-amber-300 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_35px_rgba(251,191,36,0.35)] transition hover:-translate-y-0.5 hover:bg-amber-200"
            >
              Book Strategy Call
            </TrackCTA>
            <TrackCTA
              href="/#segmentation"
              event="hero_explore_solutions"
              section="hero"
              placement="secondary"
              label="Explore Solutions"
              className="rounded-xl border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-amber-300/60 hover:bg-amber-300/10"
            >
              Explore Solutions
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
              <li>Custom architecture mapped to real operations</li>
              <li>Delivery tied to measurable executive outcomes</li>
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
