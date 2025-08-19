import { notFound } from "next/navigation";
import { posts } from "@/content/posts";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata({ params }) {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) return { title: "Post — Ghost AI Solutions" };
  return {
    title: `${post.title} — Ghost AI Solutions`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, url: `https://ghostai.solutions/blog/${post.slug}` },
  };
}

export default function PostPage({ params }) {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) return notFound();

  const { title, date, Content } = post;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <Breadcrumbs />
        <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 inline-block rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          Published: {new Date(date).toLocaleDateString()}
        </p>
        <article className="prose prose-slate dark:prose-invert mt-6 max-w-none">
          <Content />
        </article>
      </div>
    </section>
  );
}
