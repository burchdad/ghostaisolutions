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
  { label: "Pilot To Production", value: "2-6 weeks" },
  { label: "Manual Work Reduced", value: "30-70%" },
  { label: "Weekly KPI Reporting", value: "Every sprint" },
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
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
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
            className="inline-flex items-center rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200"
          >
            Custom Engineering Lab
          </motion.p>

          <motion.h1 variants={fadeUp} className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Custom Systems For Teams Outgrowing SaaS
          </motion.h1>

          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-lg text-slate-200 sm:text-xl">
            We build custom platforms, automation, AI voice, and data systems for teams that need control and speed.
          </motion.p>

          <motion.p variants={fadeUp} className="mx-auto mt-3 max-w-3xl text-sm uppercase tracking-[0.16em] text-cyan-300/90 sm:text-base">
            Best fit: growth teams with high-friction workflows, handoffs, or response bottlenecks.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex justify-center">
            <TrackCTA
              href="/contact"
              event="hero_start_project"
              section="hero"
              placement="primary"
              label="Start a Project"
              className="rounded-xl bg-cyan-400 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.35)] transition hover:-translate-y-0.5 hover:bg-cyan-300"
            >
              Start a Project
            </TrackCTA>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            <TrackCTA
              href="/contact#blueprint"
              event="hero_get_blueprint"
              section="hero"
              placement="supporting"
              label="Get a Free Blueprint"
              className="font-semibold text-cyan-200/95 transition hover:text-cyan-100"
            >
              Get a Free Blueprint
            </TrackCTA>
            <TrackCTA
              href="/projects"
              event="hero_see_work"
              section="hero"
              placement="supporting"
              label="See Our Work"
              className="font-semibold text-slate-200 transition hover:text-white"
            >
              See Our Work
            </TrackCTA>
          </motion.div>

          <motion.div variants={fadeUp} className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-cyan-300/15 bg-slate-950/70 px-4 py-3">
                <p className="text-lg font-bold text-cyan-200">{stat.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-slate-300">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="mx-auto mt-6 max-w-3xl rounded-2xl border border-white/15 bg-slate-950/60 p-4 text-left sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">How We Work</p>
            <ul className="mt-2 grid gap-2 text-sm text-slate-200 sm:grid-cols-3">
              <li>48-hour scoped recommendation</li>
              <li>Fixed-fee sprint with weekly demo</li>
              <li>KPI scoreboard tied to workflow outcomes</li>
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
