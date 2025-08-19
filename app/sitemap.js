// app/sitemap.js
// Auto-discovers routes by scanning the /app directory for page files.
// Skips dynamic routes ([slug]), API, and grouping segments (e.g., (marketing)).

export const runtime = "nodejs"; // ensure Node runtime so fs works

import fs from "fs";
import path from "path";
import { posts } from "@/content/posts";

const APP_DIR = path.join(process.cwd(), "app");
const PAGE_FILENAMES = ["page.js", "page.jsx", "page.tsx", "page.mdx"];
const EXCLUDE_DIRS = new Set([
  "api",
  "_components",
  "components",
  "_lib",
  "lib",
  "_assets",
  "assets",
]);

function isDynamicSegment(seg) {
  return seg.startsWith("[") && seg.endsWith("]");
}

function isGroupSegment(seg) {
  // Next.js grouping route: (group)
  return seg.startsWith("(") && seg.endsWith(")");
}

function hasPageFile(dir) {
  return PAGE_FILENAMES.some((f) => fs.existsSync(path.join(dir, f)));
}

function discoverRoutes(dir = APP_DIR, rel = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const routes = [];

  // If this folder itself has a page file, register a route for it
  if (hasPageFile(dir)) {
    // Convert "" to "/" for root, otherwise prefix with "/"
    const routePath = rel === "" ? "/" : `/${rel}`;
    routes.push(routePath);
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;

    // Skip excluded & special directories
    if (EXCLUDE_DIRS.has(name)) continue;
    if (isDynamicSegment(name)) continue; // skip dynamic routes
    // Remove grouping segments by not including them in the route path,
    // but still recurse into them.
    const nextRel = isGroupSegment(name)
      ? rel
      : rel
      ? `${rel}/${name}`
      : name;

    const subdir = path.join(dir, name);
    routes.push(...discoverRoutes(subdir, nextRel));
  }

  // Ensure unique, sorted
  return Array.from(new Set(routes)).sort((a, b) => a.localeCompare(b));
}

export default async function sitemap() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://ghostai.solutions";

  const discovered = discoverRoutes(); // from your existing file walker
  const now = new Date().toISOString();

  // concrete blog URLs from content
  const blogUrls = posts.map((p) => `${base}/blog/${p.slug}`);

  const staticEntries = discovered.map((route) => ({
    url: `${base}${route === "/" ? "" : route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1.0 : 0.7,
  }));

  const blogEntries = blogUrls.map((url) => ({
    url,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries];
}
