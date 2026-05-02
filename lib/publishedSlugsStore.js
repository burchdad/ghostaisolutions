/**
 * publishedSlugsStore — tracks which blog slugs have already been published to social.
 *
 * Storage priority:
 *   1. GitHub repo file via GITHUB_TOKEN (works in GitHub Actions + Vercel if token set)
 *   2. /tmp fallback (single-invocation only — no cross-call persistence)
 *
 * This prevents the social trigger from re-posting the same content every day.
 */

import fs from "fs";
import path from "path";

const GITHUB_API_BASE = "https://api.github.com";
const REMOTE_PATH = ".internal/social-published-slugs.json";
const LOCAL_PATH = path.join("/tmp", ".internal", "social-published-slugs.json");

function getGitHubConfig() {
  return {
    owner: process.env.GITHUB_REPO_OWNER || "burchdad",
    repo: process.env.GITHUB_REPO_NAME || "ghostaisolutions",
    branch: process.env.GITHUB_TARGET_BRANCH || "main",
    token:
      process.env.GITHUB_TOKEN ||
      process.env.GH_TOKEN ||
      process.env.GITHUB_PERSONAL_TOKEN ||
      "",
  };
}

function hasGitHubToken() {
  return Boolean(getGitHubConfig().token);
}

async function ghGet(url, token) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (res.status === 404) return { ok: false, status: 404, data: null };
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.message || `GitHub ${res.status}`);
  return { ok: true, status: res.status, data };
}

async function readRemoteSlugs() {
  const { owner, repo, branch, token } = getGitHubConfig();
  try {
    const result = await ghGet(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${REMOTE_PATH}?ref=${branch}`,
      token
    );
    if (!result.ok || !result.data?.content) return { slugs: [], sha: null };
    const content = JSON.parse(Buffer.from(result.data.content, "base64").toString("utf8"));
    return { slugs: Array.isArray(content.slugs) ? content.slugs : [], sha: result.data.sha };
  } catch {
    return { slugs: [], sha: null };
  }
}

async function writeRemoteSlugs(slugs, sha) {
  const { owner, repo, branch, token } = getGitHubConfig();
  const body = {
    message: "chore: update social published slugs",
    content: Buffer.from(JSON.stringify({ slugs, updatedAt: new Date().toISOString() }, null, 2), "utf8").toString("base64"),
    branch,
    ...(sha ? { sha } : {}),
  };
  const res = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${REMOTE_PATH}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `GitHub write failed (${res.status})`);
  }
}

function readLocalSlugs() {
  try {
    if (!fs.existsSync(LOCAL_PATH)) return { slugs: [], sha: null };
    const content = JSON.parse(fs.readFileSync(LOCAL_PATH, "utf8"));
    return { slugs: Array.isArray(content.slugs) ? content.slugs : [], sha: null };
  } catch {
    return { slugs: [], sha: null };
  }
}

function writeLocalSlugs(slugs) {
  try {
    fs.mkdirSync(path.dirname(LOCAL_PATH), { recursive: true });
    fs.writeFileSync(LOCAL_PATH, JSON.stringify({ slugs, updatedAt: new Date().toISOString() }, null, 2));
  } catch {
    // Best-effort
  }
}

/**
 * Returns the set of slugs already published to social.
 */
export async function getPublishedSlugs() {
  if (hasGitHubToken()) {
    const { slugs } = await readRemoteSlugs();
    return new Set(slugs);
  }
  const { slugs } = readLocalSlugs();
  return new Set(slugs);
}

/**
 * Adds one or more slugs to the published list.
 */
export async function markSlugsPublished(newSlugs) {
  if (!newSlugs || newSlugs.length === 0) return;

  if (hasGitHubToken()) {
    const { slugs, sha } = await readRemoteSlugs();
    const merged = [...new Set([...slugs, ...newSlugs])];
    await writeRemoteSlugs(merged, sha);
    return;
  }

  const { slugs } = readLocalSlugs();
  const merged = [...new Set([...slugs, ...newSlugs])];
  writeLocalSlugs(merged);
}
