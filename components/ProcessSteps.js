"use client";

import { motion } from "framer-motion";

export default function ProcessSteps({ steps }) {
  return (
    <ol className="grid gap-4 md:grid-cols-4">
      {steps.map((step, index) => (
        <motion.li
          key={step.title}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.35, delay: index * 0.06 }}
          className="relative rounded-2xl border border-white/15 bg-slate-950/65 p-5"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-sm font-semibold text-cyan-200">
            {index + 1}
          </span>
          <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
          <p className="mt-2 text-sm text-slate-300">{step.description}</p>
        </motion.li>
      ))}
    </ol>
  );
}
