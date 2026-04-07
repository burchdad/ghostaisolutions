import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Newsletter from "@/components/Newsletter";
import BlogServiceCTA from "@/components/BlogServiceCTA";
import { getAllPosts, getPostBySlug } from "@/lib/allPosts";

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

/** Renders structured sections from auto-generated JSON posts */
function AutoPostContent({ sections = [] }) {
  return (
    <>
      {sections.map((sec, i) => {
        if (sec.type === "h2") {
          return (
            <h2 key={i} className="mt-8 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {sec.text}
            </h2>
          );
        }
        if (sec.type === "ul") {
          return (
            <ul key={i} className="my-4 list-disc pl-6 space-y-1 text-slate-700 dark:text-slate-300">
              {(sec.items ?? []).map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        if (sec.type === "callout") {
          return (
            <div key={i} className="my-6 rounded-xl border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-5 py-4 text-slate-700 dark:text-slate-200 text-sm font-medium leading-relaxed">
              💡 {sec.text}
            </div>
          );
        }
        // default: paragraph
        return (
          <p key={i} className="mt-4 leading-relaxed text-slate-700 dark:text-slate-300">
            {sec.text}
          </p>
        );
      })}
    </>
  );
}

/** Sources attribution for auto-generated posts */
function SourcesBlock({ sources = [] }) {
  if (!sources.length) return null;
  return (
    <aside className="mt-10 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
        Stories Referenced
      </p>
      <ul className="space-y-2">
        {sources.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
              {s.source}
            </span>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
            >
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default function PostPage({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return notFound();

  const { title, date, excerpt, slug, category, auto, sections, sources, Content } = post;

  const url = `https://ghostai.solutions/blog/${slug}`;
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    datePublished: date,
    dateModified: date,
    description: excerpt,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Ghost AI Solutions" },
    publisher: {
      "@type": "Organization",
      name: "Ghost AI Solutions",
      logo: { "@type": "ImageObject", url: "https://ghostai.solutions/FullLogo_Transparent.png" },
    },
    url,
  };

  const CATEGORY_COLORS = {
    "ai-agents": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    automation:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    tools:       "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    strategy:    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  };

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
        />

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {category && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[category] ?? ""}`}>
              {category.replace("-", " ")}
            </span>
          )}
          {auto && (
            <span className="rounded-full border border-slate-300 dark:border-slate-600 px-2 py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
              Auto-generated
            </span>
          )}
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight leading-snug">{title}</h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Published:{" "}
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/* Article body */}
        <article className="mt-8">
          {auto ? (
            <>
              {/* Inline service CTA after the first ~3 sections */}
              <AutoPostContent sections={sections?.slice(0, 3)} />
              <BlogServiceCTA category={category} />
              <AutoPostContent sections={sections?.slice(3)} />
            </>
          ) : (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <Content />
            </div>
          )}
        </article>

        {/* Sources for auto-posts */}
        {auto && <SourcesBlock sources={sources} />}

        {/* Bottom CTA */}
        <div className="mt-12 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Want us to build this for your team?
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Ghost AI Solutions scopes, builds, and ships custom AI systems in fixed-fee sprints.
            No retainers. Full ownership handoff.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/contact#blueprint"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Get a Free Blueprint &rarr;
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
