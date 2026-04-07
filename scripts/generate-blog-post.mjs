#!/usr/bin/env node
/**
 * Ghost AI Solutions — Daily Blog Post Generator
 *
 * Adapted from: github.com/burchdad/tldr-agent-demo
 *
 * Pipeline:
 *   HackerNews (Algolia API) + GitHub Search API + Dev.to API
 *     → score by AI/automation relevance
 *     → take top 6 stories
 *     → call OpenAI to write a structured blog post in Ghost AI voice
 *     → save to content/auto-posts/<date>-<slug>.json
 *
 * Requires:
 *   OPENAI_API_KEY  — OpenAI API key (required)
 *   OPENAI_MODEL    — model to use (default: gpt-4o-mini)
 *   GITHUB_TOKEN    — optional, raises GitHub API rate limit from 60→5000/hr
 *
 * Runs safely daily: skips if a post was already generated today.
 * Uses only Node 20 built-in fetch — zero extra dependencies.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "content", "auto-posts");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is required");
  process.exit(1);
}

// ─── 1. FETCHERS ─────────────────────────────────────────────────────────────

/** HackerNews front page via Algolia API — returns JSON, no scraping */
async function fetchHackerNews() {
  try {
    const res = await fetch(
      "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=20"
    );
    if (!res.ok) throw new Error(`HN API ${res.status}`);
    const data = await res.json();
    return (data.hits ?? []).map((h) => ({
      title: h.title ?? "",
      url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
      source: "HackerNews",
      description: h.title ?? "",
      date: new Date().toISOString(),
    }));
  } catch (e) {
    console.warn(`⚠️  HackerNews fetch failed: ${e.message}`);
    return [];
  }
}

/** GitHub Search API — trending AI repos created in last 2 days */
async function fetchGitHubTrending() {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 2);
    const sinceStr = since.toISOString().slice(0, 10);

    const headers = { Accept: "application/vnd.github+json" };
    if (GITHUB_TOKEN) headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;

    const res = await fetch(
      `https://api.github.com/search/repositories?q=topic:ai+created:>${sinceStr}&sort=stars&order=desc&per_page=10`,
      { headers }
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const data = await res.json();
    return (data.items ?? []).map((r) => ({
      title: r.full_name,
      url: r.html_url,
      source: "GitHub Trending",
      description: r.description || `New AI project with ${r.stargazers_count} stars`,
      date: new Date().toISOString(),
    }));
  } catch (e) {
    console.warn(`⚠️  GitHub Trending fetch failed: ${e.message}`);
    return [];
  }
}

/** Dev.to articles tagged ai/automation — public JSON API */
async function fetchDevTo() {
  try {
    const res = await fetch(
      "https://dev.to/api/articles?state=fresh&per_page=15&tags=ai,automation,devtools"
    );
    if (!res.ok) throw new Error(`Dev.to API ${res.status}`);
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((a) => ({
      title: a.title ?? "",
      url: a.url ?? "",
      source: "Dev.to",
      description: a.description || a.title || "",
      date: a.published_at ?? new Date().toISOString(),
    }));
  } catch (e) {
    console.warn(`⚠️  Dev.to fetch failed: ${e.message}`);
    return [];
  }
}

// ─── 2. FILTER / SCORE ───────────────────────────────────────────────────────

const AI_KEYWORDS = [
  "ai", "artificial intelligence", "machine learning", "llm", "gpt", "claude",
  "agent", "neural", "reasoning", "automation", "workflow", "no-code", "openai",
  "anthropic", "mistral", "gemini", "chatgpt", "copilot", "rag", "vector",
  "embedding", "fine-tun", "prompt", "autonomous",
];
const STARTUP_KEYWORDS = [
  "startup", "funding", "seed", "series a", "launch", "yc", "saas", "growth",
  "product", "platform",
];
const DEVTOOLS_KEYWORDS = [
  "framework", "library", "sdk", "api", "open source", "cli", "developer",
  "tool", "integration", "data pipeline", "deploy",
];

function scoreStory(story) {
  const text = `${story.title} ${story.description}`.toLowerCase();
  let score = 0;
  AI_KEYWORDS.forEach((k) => { if (text.includes(k)) score += 3; });
  STARTUP_KEYWORDS.forEach((k) => { if (text.includes(k)) score += 1; });
  DEVTOOLS_KEYWORDS.forEach((k) => { if (text.includes(k)) score += 1; });
  return score;
}

function filterAndRank(stories) {
  // Deduplicate by URL
  const seen = new Set();
  const unique = stories.filter((s) => {
    if (!s.url || seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });

  return unique
    .map((s) => ({ ...s, relevanceScore: scoreStory(s) }))
    .filter((s) => s.relevanceScore >= 3)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 6);
}

// ─── 3. OPENAI BLOG GENERATOR ────────────────────────────────────────────────

async function generateBlogPost(stories) {
  const storySummaries = stories
    .map(
      (s, i) =>
        `${i + 1}. "${s.title}" (${s.source})\n   ${s.description.slice(0, 250)}\n   URL: ${s.url}`
    )
    .join("\n\n");

  const systemPrompt = `You are the content director for Ghost AI Solutions, a boutique AI systems studio that builds custom automation platforms, AI voice agents, and data pipelines for growth-stage B2B operators.

Audience: COOs, RevOps leads, and growth PMs at companies with 20-200 employees who are outgrowing off-the-shelf SaaS.

Voice: Direct, no-jargon, ROI-focused. Occasionally dry. Never uses buzzwords like "revolutionize," "game-changing," or "unlock."`;

  const userPrompt = `Today's top tech stories:
${storySummaries}

Write a blog post that:
1. Connects these stories to real implications for the audience
2. Extracts actionable insights (what can they do THIS WEEK?)
3. Is 600-900 words total with a strong, clear title
4. Ends with a practical "this week's takeaway" callout

Return ONLY a valid JSON object (no markdown fences) with this exact structure:
{
  "title": "string — compelling, 6-12 words, not clickbait",
  "excerpt": "string — 2 sentences describing what the reader will learn",
  "category": "one of: ai-agents | automation | tools | strategy",
  "tags": ["string", "string", "string"],
  "sections": [
    { "type": "p", "text": "..." },
    { "type": "h2", "text": "..." },
    { "type": "p", "text": "..." },
    { "type": "ul", "items": ["...", "...", "..."] },
    { "type": "callout", "text": "This week's takeaway — 1-2 actionable sentences" }
  ]
}

Allowed section types: "p" (paragraph), "h2" (subheading), "ul" (bullet list with items array), "callout" (highlighted box).
Aim for 10-14 sections total.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.72,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Empty response from OpenAI");

  return JSON.parse(raw);
}

// ─── 4. MAIN ─────────────────────────────────────────────────────────────────

async function main() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Skip if we already ran today (idempotent)
  const existing = fs.readdirSync(OUTPUT_DIR).filter((f) => f.startsWith(today));
  if (existing.length > 0) {
    console.log(`✓ Post already generated for ${today}: ${existing[0]}`);
    process.exit(0);
  }

  console.log(`📡 Fetching stories for ${today}...`);
  const [hn, github, devto] = await Promise.all([
    fetchHackerNews(),
    fetchGitHubTrending(),
    fetchDevTo(),
  ]);

  const allStories = [...hn, ...github, ...devto];
  console.log(`   Total fetched: ${allStories.length} stories`);

  const topStories = filterAndRank(allStories);
  if (topStories.length === 0) {
    console.error("❌ No relevant stories found today — skipping");
    process.exit(0); // exit 0 so the GH Action doesn't fail
  }
  console.log(`🔍 Top ${topStories.length} stories selected`);
  topStories.forEach((s, i) =>
    console.log(`   ${i + 1}. [${s.relevanceScore}★] ${s.title} (${s.source})`)
  );

  console.log(`✨ Generating blog post via OpenAI (${OPENAI_MODEL})...`);
  const post = await generateBlogPost(topStories);

  // Validate required fields
  if (!post.title || !post.sections?.length) {
    throw new Error("OpenAI returned an incomplete post structure");
  }

  // Build slug from date + title
  const slugBase = post.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const slug = `${today}-${slugBase}`;

  const output = {
    slug,
    title: post.title,
    date: today,
    excerpt: post.excerpt ?? "",
    category: ["ai-agents", "automation", "tools", "strategy"].includes(post.category)
      ? post.category
      : "ai-agents",
    tags: Array.isArray(post.tags) ? post.tags.slice(0, 5) : [],
    sections: post.sections,
    sources: topStories.map(({ title, url, source, relevanceScore }) => ({
      title,
      url,
      source,
      relevanceScore,
    })),
    auto: true,
  };

  const outFile = path.join(OUTPUT_DIR, `${slug}.json`);
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2));

  console.log(`\n✅ Post saved: content/auto-posts/${slug}.json`);
  console.log(`   Title:    ${output.title}`);
  console.log(`   Category: ${output.category}`);
  console.log(`   Sections: ${output.sections.length}`);
}

main().catch((err) => {
  console.error("❌ Fatal error:", err.message ?? err);
  process.exit(1);
});
