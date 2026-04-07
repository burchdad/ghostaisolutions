import Link from "next/link";
import { getAllPosts } from "@/lib/allPosts";
import Breadcrumbs from "@/components/Breadcrumbs";
import Newsletter from "@/components/Newsletter";

export const metadata = {
  title: "Blog — Ghost AI Solutions",
  description:
    "Practical reads on AI agents, workflow automation, and growth — updated daily by our research agent.",
};

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "ai-agents", label: "AI Agents" },
  { key: "automation", label: "Automation" },
  { key: "tools", label: "Tools" },
  { key: "strategy", label: "Strategy" },
];

const CATEGORY_COLORS = {
  "ai-agents": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  automation:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  tools:       "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  strategy:    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

function categoryLabel(cat) {
  return CATEGORIES.find((c) => c.key === cat)?.label ?? cat;
}

export default function BlogIndex({ searchParams }) {
  const activeCategory = searchParams?.category ?? "all";
  const posts = getAllPosts();

  const filtered =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const [featured, ...rest] = filtered;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Blog</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Short, actionable reads on AI agents &amp; workflow automation —
              auto-curated daily from the teams actually building this stuff.
            </p>
          </div>
          <a
            href="/feed"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-400 transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z" />
            </svg>
            RSS
          </a>
        </div>

        {/* Category Tabs */}
        <div className="mt-8 flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              href={cat.key === "all" ? "/blog" : `/blog?category=${cat.key}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat.key
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-500"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Featured Post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group mt-10 block">
            <article className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-8 hover:border-indigo-400 transition-colors cursor-pointer">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                  Latest
                </span>
                {featured.category && (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[featured.category] ?? ""}`}>
                    {categoryLabel(featured.category)}
                  </span>
                )}
                {featured.auto && (
                  <span className="rounded-full border border-slate-300 dark:border-slate-600 px-2 py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    Auto-generated
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {featured.title}
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {new Date(featured.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                {featured.excerpt}
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                Read the full post &rarr;
              </span>
            </article>
          </Link>
        )}

        {/* Post Grid */}
        {rest.length > 0 && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {rest.map((p) => (
              <article
                key={p.slug}
                className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 hover:border-indigo-400 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {p.category && (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[p.category] ?? ""}`}>
                      {categoryLabel(p.category)}
                    </span>
                  )}
                  {p.auto && (
                    <span className="rounded-full border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                      Auto
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold leading-snug">
                  <Link
                    href={`/blog/${p.slug}`}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {p.title}
                  </Link>
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {new Date(p.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                  {p.excerpt}
                </p>
                <Link
                  href={`/blog/${p.slug}`}
                  className="mt-3 inline-flex text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Read more &rarr;
                </Link>
              </article>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-slate-500 dark:text-slate-400">
            No posts in this category yet — check back tomorrow.
          </p>
        )}

        {/* Conversion banner */}
        <div className="mt-14 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-2">
            From Ghost AI Solutions
          </p>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Stop reading about automation. Start running it.
          </h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            We build custom AI agents, automation platforms, and data pipelines
            for growth teams. Fixed fee. No retainer. Shipped in sprints.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="/contact#blueprint"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Get a Free Blueprint
            </a>
            <a
              href="/work"
              className="rounded-lg border border-slate-300 dark:border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition-colors"
            >
              See Our Work &rarr;
            </a>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-10">
          <Newsletter />
        </div>
      </div>
    </section>
  );
}
