import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getGitHubRepositoryAccess, hasGitHubWriteConfig } from "@/lib/githubAppAuth";

const GITHUB_API_BASE = "https://api.github.com";
const BASE_INTERNAL_DIR = process.env.VERCEL ? path.join("/tmp", ".internal") : path.join(process.cwd(), ".internal");
const DIR = path.join(BASE_INTERNAL_DIR, "reddit-intelligence");
const LOCAL_FILE = path.join(DIR, "opportunities.json");
const REMOTE_PATH = ".internal/reddit-intelligence/opportunities.json";

function nowIso() {
  return new Date().toISOString();
}

function makeId(seed = "reddit") {
  const hash = crypto.createHash("sha1").update(`${seed}-${Date.now()}`).digest("hex").slice(0, 8);
  return `reddit-${Date.now().toString(36)}-${hash}`;
}

function ensureDir() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
}

function readLocal() {
  ensureDir();
  if (!fs.existsSync(LOCAL_FILE)) return [];
  try {
    const value = JSON.parse(fs.readFileSync(LOCAL_FILE, "utf8"));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeLocal(items) {
  ensureDir();
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(items, null, 2), "utf8");
}

function getGitHubConfig() {
  return {
    owner: process.env.GITHUB_REPO_OWNER || "burchdad",
    repo: process.env.GITHUB_REPO_NAME || "ghostaisolutions",
    branch: process.env.GITHUB_TARGET_BRANCH || "main",
  };
}

async function githubRequest(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (response.status === 404) return { ok: false, data: null, status: 404 };
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || `GitHub request failed (${response.status})`);
  return { ok: true, data, status: response.status };
}

async function readRemote() {
  const cfg = getGitHubConfig();
  const access = await getGitHubRepositoryAccess({ owner: cfg.owner, repo: cfg.repo });
  const response = await githubRequest(
    `${GITHUB_API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${REMOTE_PATH}?ref=${cfg.branch}`,
    access.token
  );

  if (!response.ok || !response.data?.content) return { items: [], sha: null, cfg, token: access.token };
  const value = JSON.parse(Buffer.from(response.data.content, "base64").toString("utf8"));
  return { items: Array.isArray(value) ? value : [], sha: response.data.sha, cfg, token: access.token };
}

async function writeRemote(items, sha = null, cfg = getGitHubConfig(), token = null) {
  const accessToken = token || (await getGitHubRepositoryAccess({ owner: cfg.owner, repo: cfg.repo })).token;
  await githubRequest(`${GITHUB_API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${REMOTE_PATH}`, accessToken, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "chore: update reddit intelligence opportunities",
      content: Buffer.from(JSON.stringify(items, null, 2), "utf8").toString("base64"),
      branch: cfg.branch,
      ...(sha ? { sha } : {}),
    }),
  });
}

function sortItems(items) {
  return items.sort((a, b) => new Date(b.updatedAt || b.foundAt) - new Date(a.updatedAt || a.foundAt));
}

function hydrateOpportunity(item, existing = {}) {
  const now = nowIso();
  return {
    id: existing.id || item.id || makeId(item.postId || item.sourceUrl || item.title),
    foundAt: existing.foundAt || item.foundAt || now,
    updatedAt: now,
    status: existing.status || item.status || "drafted",
    postedAt: existing.postedAt || item.postedAt || null,
    dismissedAt: existing.dismissedAt || item.dismissedAt || null,
    commentResult: existing.commentResult || item.commentResult || null,
    ...existing,
    ...item,
  };
}

async function readAll() {
  if (!hasGitHubWriteConfig()) return { items: readLocal(), sha: null };
  return readRemote();
}

async function writeAll(items, meta = {}) {
  const trimmed = sortItems(items).slice(0, 250);
  if (!hasGitHubWriteConfig()) {
    writeLocal(trimmed);
    return trimmed;
  }
  await writeRemote(trimmed, meta.sha, meta.cfg, meta.token);
  return trimmed;
}

export async function listRedditOpportunities({ limit = 100, status = "" } = {}) {
  const { items } = await readAll();
  const filtered = status ? items.filter((item) => item.status === status) : items;
  return sortItems(filtered).slice(0, limit);
}

export async function upsertRedditOpportunities(incoming = []) {
  const meta = await readAll();
  const byPostId = new Map(meta.items.map((item) => [item.postId || item.sourceUrl, item]));
  let added = 0;
  let updated = 0;

  for (const item of incoming) {
    const key = item.postId || item.sourceUrl;
    if (!key) continue;
    const existing = byPostId.get(key);
    byPostId.set(key, hydrateOpportunity(item, existing || {}));
    if (existing) updated++;
    else added++;
  }

  const items = await writeAll(Array.from(byPostId.values()), meta);
  return { added, updated, items };
}

export async function updateRedditOpportunity(id, patch = {}) {
  const meta = await readAll();
  const index = meta.items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  meta.items[index] = hydrateOpportunity({ ...meta.items[index], ...patch, id }, meta.items[index]);
  await writeAll(meta.items, meta);
  return meta.items[index];
}

export async function getRedditOpportunity(id) {
  const { items } = await readAll();
  return items.find((item) => item.id === id) || null;
}

export async function getRedditIntelligenceStats() {
  const items = await listRedditOpportunities({ limit: 250 });
  const cutoff = Date.now() - 86400000;
  return {
    total: items.length,
    last24h: items.filter((item) => new Date(item.foundAt).getTime() >= cutoff).length,
    drafted: items.filter((item) => item.status === "drafted").length,
    posted: items.filter((item) => item.status === "posted").length,
    dismissed: items.filter((item) => item.status === "dismissed").length,
    highIntent: items.filter((item) => (item.intentScore || 0) >= 75).length,
  };
}
