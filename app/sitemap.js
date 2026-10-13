import { getAllPosts } from "@/lib/allPosts";
import { sitemapEntries } from "@/lib/seo.mjs";

export const runtime = "nodejs";

export default function sitemap() {
  return sitemapEntries(getAllPosts());
}
