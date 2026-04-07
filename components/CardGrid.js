"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CardGrid({ items }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <motion.article
          key={item.title}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.35, delay: index * 0.04 }}
          whileHover={{ y: -4 }}
          className="group rounded-2xl border border-cyan-300/20 bg-slate-950/65 p-6 shadow-[0_20px_50px_rgba(8,145,178,0.12)]"
        >
          {item.tag ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/90">{item.tag}</p>
          ) : null}
          <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.description}</p>
          {item.meta ? <p className="mt-4 text-sm text-amber-300">{item.meta}</p> : null}
          {item.href ? (
            <Link href={item.href} className="mt-5 inline-flex text-sm font-semibold text-cyan-300 transition group-hover:text-cyan-200">
              Explore -&gt;
            </Link>
          ) : null}
        </motion.article>
      ))}
    </div>
  );
}
