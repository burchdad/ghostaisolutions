/**
 * Ghost AI Solutions — AI Image Generation Helper
 *
 * Wraps OpenAI DALL-E 3 (or a compatible endpoint) to generate
 * cover images for blog posts and social media.
 *
 * Output: saves PNG to /public/generated/<slug>.png and returns
 * a relative URL path usable in <img> tags.
 *
 * Uses zero additional dependencies — native fetch only.
 */

import fs from "fs";
import path from "path";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const GENERATED_DIR = path.join(process.cwd(), "public", "generated");

function ensureDir() {
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }
}

/**
 * Build a safe filesystem-friendly filename from any string.
 */
function slugify(str = "") {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

/**
 * Generate a cover image for a post using DALL-E 3.
 *
 * @param {object} opts
 * @param {string} opts.title      — Blog post / social post title
 * @param {string} opts.excerpt    — Short description for context
 * @param {string} [opts.slug]     — Used for the filename; auto-derived if omitted
 * @param {string} [opts.style]    — "editorial" | "tech" | "minimal" (default: "editorial")
 * @returns {Promise<{url: string, localPath: string, prompt: string} | {error: string}>}
 */
export async function generateCoverImage({ title, excerpt = "", slug, style = "editorial" }) {
  if (!OPENAI_API_KEY) {
    return { error: "OPENAI_API_KEY not configured" };
  }

  const styleGuide = {
    editorial: "dark gradient background, minimal sleek design, glowing cyan and indigo accents, futuristic professional, no text",
    tech:      "abstract circuit board pattern, deep navy and electric blue palette, sharp geometric shapes, high-tech aesthetic, no text",
    minimal:   "clean white and slate background, subtle line art, modern Swiss design, very minimal, no text",
  }[style] || "dark gradient background, minimal sleek design, glowing accents, no text";

  const prompt = `Professional blog cover image for an AI technology company post titled "${title}". ${excerpt ? `Topic: ${excerpt.slice(0, 150)}. ` : ""}Style: ${styleGuide}. Wide banner format, 16:9 aspect ratio.`;

  try {
    const res = await fetch(`${OPENAI_BASE_URL}/images/generations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1792x1024",
        response_format: "b64_json",
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err?.error?.message || `OpenAI image API error ${res.status}` };
    }

    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return { error: "No image data returned from OpenAI" };

    ensureDir();
    const filename = `${slugify(slug || title)}.png`;
    const localPath = path.join(GENERATED_DIR, filename);
    fs.writeFileSync(localPath, Buffer.from(b64, "base64"));

    return {
      url: `/generated/${filename}`,
      localPath,
      prompt,
    };
  } catch (e) {
    return { error: e.message };
  }
}

/**
 * List all previously generated images with metadata.
 */
export function listGeneratedImages() {
  ensureDir();
  return fs
    .readdirSync(GENERATED_DIR)
    .filter((f) => /\.(png|jpg|webp)$/.test(f))
    .map((filename) => {
      const stat = fs.statSync(path.join(GENERATED_DIR, filename));
      return {
        filename,
        url: `/generated/${filename}`,
        createdAt: stat.birthtime.toISOString(),
        sizeKb: Math.round(stat.size / 1024),
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
