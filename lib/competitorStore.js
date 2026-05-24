/**
 * Competitor Intelligence Store
 * Persists competitor profiles and weekly scans to .internal/competitors/
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getGitHubRepositoryAccess, hasGitHubAppConfig } from "@/lib/githubAppAuth";

const GITHUB_API_BASE = "https://api.github.com";
const BASE_INTERNAL_DIR = process.env.VERCEL ? path.join("/tmp", ".internal") : path.join(process.cwd(), ".internal");
const DIR = path.join(BASE_INTERNAL_DIR, "competitors");
const COMPETITORS_FILE = path.join(DIR, "competitors.json");
const SCANS_FILE = path.join(DIR, "scans.json");
const REMOTE_DIR = ".internal/competitors";
const REMOTE_COMPETITORS_PATH = `${REMOTE_DIR}/competitors.json`;
const REMOTE_SCANS_PATH = `${REMOTE_DIR}/scans.json`;

function getGitHubConfig() {
  return {
    owner: process.env.GITHUB_REPO_OWNER || "burchdad",
    repo: process.env.GITHUB_REPO_NAME || "ghostaisolutions",
    branch: process.env.GITHUB_TARGET_BRANCH || "main",
  };
}

function ensureDir() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
}

function readJson(file, fallback = []) {
  ensureDir();
  if (!fs.existsSync(file)) return fallback;
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function writeJson(file, data) {
  ensureDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function nowIso() { return new Date().toISOString(); }

function makeId(p = "comp") {
  return `${p}-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`;
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

  if (response.status === 404) {
    return { ok: false, status: 404, data: null };
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || `GitHub request failed (${response.status})`);
  }

  return { ok: true, status: response.status, data };
}

async function getRemoteAccess() {
  const cfg = getGitHubConfig();
  const access = await getGitHubRepositoryAccess({ owner: cfg.owner, repo: cfg.repo });
  return { cfg, token: access.token };
}

async function readRemoteJson(remotePath, fallback = []) {
  const { cfg, token } = await getRemoteAccess();
  const response = await githubRequest(
    `${GITHUB_API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${remotePath}?ref=${cfg.branch}`,
    token
  );

  if (!response.ok || !response.data?.content) return { value: fallback, sha: null };
  const value = JSON.parse(Buffer.from(response.data.content, "base64").toString("utf8"));
  return { value: Array.isArray(value) ? value : fallback, sha: response.data.sha };
}

async function writeRemoteJson(remotePath, value, sha = null) {
  const { cfg, token } = await getRemoteAccess();
  await githubRequest(
    `${GITHUB_API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${remotePath}`,
    token,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `chore: update ${remotePath}`,
        content: Buffer.from(JSON.stringify(value, null, 2), "utf8").toString("base64"),
        branch: cfg.branch,
        ...(sha ? { sha } : {}),
      }),
    }
  );
}

function normalizeDomain(value = "") {
  return String(value)
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .toLowerCase();
}

function buildCompetitor(input, existing = {}) {
  const now = nowIso();
  const name = input.name || existing.name || "Unknown competitor";
  const domain = normalizeDomain(input.domain || existing.domain || "");
  return {
    id: existing.id || input.id || makeId(),
    createdAt: existing.createdAt || now,
    updatedAt: now,
    name,
    domain,
    linkedinUrl: input.linkedinUrl ?? existing.linkedinUrl ?? "",
    twitterHandle: input.twitterHandle ?? existing.twitterHandle ?? "",
    notes: input.notes ?? existing.notes ?? "",
    discoverySource: input.discoverySource ?? existing.discoverySource ?? "",
    discoveryQuery: input.discoveryQuery ?? existing.discoveryQuery ?? "",
    lastDiscoveredAt: input.lastDiscoveredAt ?? existing.lastDiscoveredAt ?? null,
    lastScannedAt: input.lastScannedAt ?? existing.lastScannedAt ?? null,
  };
}

// ─── Competitors ──────────────────────────────────────────────────────────────

export function listCompetitors() {
  return readJson(COMPETITORS_FILE);
}

export async function listCompetitorsAsync() {
  if (!hasGitHubAppConfig()) return listCompetitors();
  const { value } = await readRemoteJson(REMOTE_COMPETITORS_PATH, []);
  return value.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
}

export function upsertCompetitor({ name, domain, linkedinUrl = "", twitterHandle = "", notes = "" }) {
  const all = readJson(COMPETITORS_FILE);
  const cleanDomain = normalizeDomain(domain);
  const idx = all.findIndex((c) => c.domain === cleanDomain || c.name.toLowerCase() === name.toLowerCase());
  if (idx !== -1) {
    all[idx] = buildCompetitor({ name, domain: cleanDomain, linkedinUrl, twitterHandle, notes }, all[idx]);
    writeJson(COMPETITORS_FILE, all);
    return { competitor: all[idx], created: false };
  }
  const comp = buildCompetitor({ name, domain: cleanDomain, linkedinUrl, twitterHandle, notes });
  all.push(comp);
  writeJson(COMPETITORS_FILE, all);
  return { competitor: comp, created: true };
}

export async function upsertCompetitorsAsync(items = []) {
  if (!hasGitHubAppConfig()) {
    let added = 0;
    let updated = 0;
    const competitors = [];
    for (const item of items) {
      const result = upsertCompetitor(item);
      competitors.push(result.competitor);
      if (result.created) added++;
      else updated++;
    }
    return { added, updated, competitors };
  }

  const { value: all, sha } = await readRemoteJson(REMOTE_COMPETITORS_PATH, []);
  const byDomain = new Map(all.map((c) => [normalizeDomain(c.domain), c]));
  const byName = new Map(all.map((c) => [String(c.name || "").toLowerCase(), c]));
  let added = 0;
  let updated = 0;
  const competitors = [];

  for (const item of items) {
    const cleanDomain = normalizeDomain(item.domain);
    if (!cleanDomain || !item.name) continue;
    const existing = byDomain.get(cleanDomain) || byName.get(String(item.name).toLowerCase());
    const next = buildCompetitor({ ...item, domain: cleanDomain }, existing || {});
    byDomain.set(cleanDomain, next);
    byName.set(String(next.name || "").toLowerCase(), next);
    competitors.push(next);
    if (existing) updated++;
    else added++;
  }

  const merged = Array.from(byDomain.values()).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  await writeRemoteJson(REMOTE_COMPETITORS_PATH, merged, sha);
  return { added, updated, competitors };
}

export function getCompetitor(id) {
  return readJson(COMPETITORS_FILE).find((c) => c.id === id) || null;
}

export function updateCompetitor(id, patch) {
  const all = readJson(COMPETITORS_FILE);
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  all[idx] = buildCompetitor({ ...all[idx], ...patch, id }, all[idx]);
  writeJson(COMPETITORS_FILE, all);
  return all[idx];
}

export async function updateCompetitorAsync(id, patch) {
  if (!hasGitHubAppConfig()) return updateCompetitor(id, patch);
  const { value: all, sha } = await readRemoteJson(REMOTE_COMPETITORS_PATH, []);
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  all[idx] = buildCompetitor({ ...all[idx], ...patch, id }, all[idx]);
  await writeRemoteJson(REMOTE_COMPETITORS_PATH, all, sha);
  return all[idx];
}

export function removeCompetitor(id) {
  writeJson(COMPETITORS_FILE, readJson(COMPETITORS_FILE).filter((c) => c.id !== id));
}

export async function removeCompetitorAsync(id) {
  if (!hasGitHubAppConfig()) return removeCompetitor(id);
  const { value: all, sha } = await readRemoteJson(REMOTE_COMPETITORS_PATH, []);
  await writeRemoteJson(REMOTE_COMPETITORS_PATH, all.filter((c) => c.id !== id), sha);
}

// ─── Scans ────────────────────────────────────────────────────────────────────

export function listScans({ limit = 20 } = {}) {
  return readJson(SCANS_FILE)
    .sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt))
    .slice(0, limit);
}

export async function listScansAsync({ limit = 20 } = {}) {
  if (!hasGitHubAppConfig()) return listScans({ limit });
  const { value } = await readRemoteJson(REMOTE_SCANS_PATH, []);
  return value
    .sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt))
    .slice(0, limit);
}

export function saveScans(scanResults) {
  const all = readJson(SCANS_FILE);
  const newScans = scanResults.map((r) => ({ id: makeId("scan"), scannedAt: nowIso(), ...r }));
  const updated = [...newScans, ...all].slice(0, 100); // keep last 100
  writeJson(SCANS_FILE, updated);
  return newScans;
}

export async function saveScansAsync(scanResults) {
  if (!hasGitHubAppConfig()) return saveScans(scanResults);
  const { value: all, sha } = await readRemoteJson(REMOTE_SCANS_PATH, []);
  const newScans = scanResults.map((r) => ({ id: makeId("scan"), scannedAt: nowIso(), ...r }));
  const updated = [...newScans, ...all].slice(0, 100);
  await writeRemoteJson(REMOTE_SCANS_PATH, updated, sha);
  return newScans;
}

export function getCompetitorStats() {
  const competitors = readJson(COMPETITORS_FILE);
  const scans = readJson(SCANS_FILE);
  const lastScan = scans[0]?.scannedAt || null;
  return { total: competitors.length, scans: scans.length, lastScan };
}

export async function getCompetitorStatsAsync() {
  if (!hasGitHubAppConfig()) return getCompetitorStats();
  const [competitors, scans] = await Promise.all([
    listCompetitorsAsync(),
    listScansAsync({ limit: 100 }),
  ]);
  const lastScan = scans[0]?.scannedAt || null;
  return { total: competitors.length, scans: scans.length, lastScan };
}
