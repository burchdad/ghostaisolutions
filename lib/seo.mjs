// One production origin for canonical URLs, structured data, and discovery feeds.
// Preview hosts and deployment environment variables must never enter search signals.
export const SITE_ORIGIN = "https://www.ghostai.solutions";
export const DEFAULT_TITLE = "Ghost AI Solutions - Websites, Automation, and AI Systems";
export const DEFAULT_DESCRIPTION = "Modern websites, lead funnels, automations, and AI-powered systems for businesses that need a sharper digital presence and cleaner operations.";

// Only reviewed, public, canonical pages belong in the sitemap. New app routes do
// not become indexable sitemap entries automatically. /contact duplicates /start;
// /privacy redirects to /privacy-policy; admin, portal, and growth-lab are utilities.
export const INDEXABLE_ROUTES = [
  "/", "/ai-native", "/blog", "/chatbot", "/data-deletion", "/demo",
  "/enterprise", "/faq", "/for-growth", "/for-startups",
  "/privacy-policy", "/process", "/projects", "/services", "/start",
  "/technology", "/terms", "/work",
];

export function canonicalUrl(pathname = "/") {
  const path = pathname.split(/[?#]/, 1)[0];
  return `${SITE_ORIGIN}${path === "/" ? "" : `/${path.replace(/^\/+|\/+$/g, "")}`}`;
}

export function pageMetadata(pathname, metadata = {}) {
  const title = metadata.title || DEFAULT_TITLE;
  const description = metadata.description || DEFAULT_DESCRIPTION;
  const url = canonicalUrl(pathname);
  return {
    ...metadata,
    title,
    description,
    alternates: {
      ...metadata.alternates,
      canonical: url,
      types: { "application/rss+xml": "/feed", ...metadata.alternates?.types },
    },
    openGraph: {
      siteName: "Ghost AI Solutions",
      images: [`${SITE_ORIGIN}/og-image.png`],
      type: "website",
      ...metadata.openGraph,
      title,
      description,
      url,
    },
    twitter: { card: "summary_large_image", images: [`${SITE_ORIGIN}/og-image.png`], ...metadata.twitter, title, description },
  };
}

export function sitemapEntries(posts = []) {
  const staticEntries = INDEXABLE_ROUTES.map((route) => ({ url: canonicalUrl(route) }));
  const seen = new Set();
  const blogEntries = posts.filter((post) => {
    if (!post.slug || !/^[a-zA-Z0-9-]+$/.test(post.slug) || seen.has(post.slug)) return false;
    seen.add(post.slug);
    return true;
  }).map((post) => {
    const entry = { url: canonicalUrl(`/blog/${post.slug}`) };
    // Use content dates rather than claiming every page changed on each build.
    const modified = post.updatedAt || post.date;
    if (modified && !Number.isNaN(Date.parse(modified))) entry.lastModified = new Date(modified).toISOString();
    return entry;
  });
  return [...staticEntries, ...blogEntries];
}
