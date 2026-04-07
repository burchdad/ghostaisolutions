/**
 * lib/allPosts.js
 *
 * Unified post reader — merges hand-authored posts from content/posts.js
 * with auto-generated posts from content/auto-posts/*.json.
 *
 * Only call this from Server Components (uses fs).
 */
import fs from "fs";
import path from "path";
import { posts as staticPosts } from "@/content/posts";

const AUTO_DIR = path.join(process.cwd(), "content", "auto-posts");

/**
 * Returns all posts (static + auto-generated), sorted newest-first.
 * Auto-posts have { auto: true } and a `sections` array instead of `Content`.
 */
export function getAllPosts() {
  let autoPosts = [];
  if (fs.existsSync(AUTO_DIR)) {
    autoPosts = fs
      .readdirSync(AUTO_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        try {
          const raw = fs.readFileSync(path.join(AUTO_DIR, f), "utf8");
          return { ...JSON.parse(raw), auto: true };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }

  return [...autoPosts, ...staticPosts].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
}

export function getPostBySlug(slug) {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}
