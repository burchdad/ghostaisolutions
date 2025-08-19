import Link from "next/link";
import { posts } from "@/content/posts";
import Breadcrumbs from "@/components/Breadcrumbs";
import Newsletter from "@/components/Newsletter";

export const metadata = { title: "Blog — Ghost AI Solutions" };

export default function BlogIndex() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        <h1 className="text-4xl font-extrabold tracking-tight">Blog</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Short, practical reads on AI agents, governance, and growth.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <article
              key={p.slug}
              className="rounded-2xl border p-6 bg-white dark:bg-slate-900"
            >
              <h2 className="text-xl font-semibold">
                <Link href={`/blog/${p.slug}`} className="hover:underline">
                  {p.title}
                </Link>
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {new Date(p.date).toLocaleDateString()}
              </p>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                {p.excerpt}
              </p>
              <Link
                href={`/blog/${p.slug}`}
                className="mt-4 inline-flex text-brand-600 dark:text-brand-300 underline"
              >
                Read more
              </Link>
            </article>
          ))}
        </div>

        {/* 👇 Newsletter signup lives here, after the posts */}
        <div className="mt-12">
          <Newsletter />
        </div>
      </div>
    </section>
  );
}
