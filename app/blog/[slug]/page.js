export default function PostPage({ params }) {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) return notFound();

  const { title, date, Content, excerpt, slug } = post;

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
      logo: {
        "@type": "ImageObject",
        url: "https://ghostai.solutions/logo.png"
      }
    },
    url
  };

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs />
        <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 inline-block rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          Published: {new Date(date).toLocaleDateString()}
        </p>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
        />
        <article className="prose prose-slate dark:prose-invert mt-6 max-w-none">
          <Content />
        </article>
      </div>
    </section>
  );
}
