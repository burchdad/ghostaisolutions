"use client";

import { motion } from "framer-motion";
import GhostAvatar from "@/components/GhostAvatar";
import TrackCTA from "@/components/TrackCTA";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 py-24 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-0 hero-grid" />
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
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
          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-3xl text-lg text-slate-200 sm:text-xl">
            We engineer platforms, automation, AI voice, and data systems from scratch for operators who need control, speed, and measurable lift.
          </motion.p>
          <motion.p variants={fadeUp} className="mx-auto mt-3 max-w-3xl text-sm font-medium uppercase tracking-[0.18em] text-cyan-300/90 sm:text-base">
            Built for growth teams, field ops, and revenue leaders under delivery pressure.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap justify-center gap-4">
            <TrackCTA
              href="/contact"
              event="hero_start_project"
              section="hero"
              placement="primary"
              label="Start a Project"
              className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.35)] transition hover:-translate-y-0.5 hover:bg-cyan-300"
            >
              Start a Project
            </TrackCTA>
            <TrackCTA
              href="/contact#blueprint"
              event="hero_get_blueprint"
              section="hero"
              placement="secondary"
              label="Get a Free Blueprint"
              className="rounded-xl border border-cyan-300/40 bg-cyan-300/10 px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/20"
            >
              Get a Free Blueprint
            </TrackCTA>
            <TrackCTA
              href="/projects"
              event="hero_see_work"
              section="hero"
              placement="tertiary"
              label="See Our Work"
              className="rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
            >
              See Our Work
            </TrackCTA>
          </motion.div>

          <motion.div variants={fadeUp} className="mx-auto mt-10 max-w-xl sm:max-w-2xl">
            <GhostAvatar />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
