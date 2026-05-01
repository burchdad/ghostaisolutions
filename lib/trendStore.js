/**
 * Trend Intelligence Store
 * Persists fetched trend signals to .internal/trends/ locally
 * or to GitHub-backed storage when GitHub App is configured.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";

const LOCAL_TREND_DIR = path.join(process.cwd(), ".internal", "trends");
const TRENDS_FILE = "trends.json";

function nowIso() {
  return new Date().toISOString();
}

function createTrendId(title = "trend") {
  const hash = crypto.createHash("sha1").update(`${title}-${Date.now()}`).digest("hex").slice(0, 8);
  return `trend-${Date.now().toString(36)}-${hash}`;
}

function ensureDir() {
  if (!fs.existsSync(LOCAL_TREND_DIR)) {
    fs.mkdirSync(LOCAL_TREND_DIR, { recursive: true });
  }
}

function readLocalTrends() {
  ensureDir();
  const filePath = path.join(LOCAL_TREND_DIR, TRENDS_FILE);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return [];
  }
}

function writeLocalTrends(trends) {
  ensureDir();
  const filePath = path.join(LOCAL_TREND_DIR, TRENDS_FILE);
  fs.writeFileSync(filePath, JSON.stringify(trends, null, 2), "utf8");
}

/** List all stored trends, sorted newest first */
export function listTrends() {
  const trends = readLocalTrends();
  return trends.sort((a, b) => new Date(b.fetchedAt) - new Date(a.fetchedAt));
}

/** Upsert a batch of raw trend items — deduped by URL */
export function upsertTrends(items = []) {
  const existing = readLocalTrends();
  const byUrl = new Map(existing.map((t) => [t.url, t]));

  let added = 0;
  let updated = 0;

  for (const item of items) {
    if (!item.url) continue;
    const prev = byUrl.get(item.url);
    if (prev) {
      byUrl.set(item.url, { ...prev, ...item, id: prev.id, updatedAt: nowIso() });
      updated++;
    } else {
      byUrl.set(item.url, {
        id: createTrendId(item.title),
        fetchedAt: nowIso(),
        updatedAt: nowIso(),
        drafted: false,
        ...item,
      });
      added++;
    }
  }

  writeLocalTrends(Array.from(byUrl.values()));
  return { added, updated };
}

/** Mark a trend as drafted (so it won't be auto-drafted again) */
export function markTrendDrafted(id) {
  const trends = readLocalTrends();
  const idx = trends.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  trends[idx].drafted = true;
  trends[idx].draftedAt = nowIso();
  writeLocalTrends(trends);
  return true;
}

/** Delete old trends (older than N days) — keeps the store lean */
export function pruneOldTrends(days = 7) {
  const cutoff = Date.now() - days * 86400000;
  const all = readLocalTrends();
  const fresh = all.filter((t) => new Date(t.fetchedAt).getTime() >= cutoff);
  writeLocalTrends(fresh);
  return all.length - fresh.length;
}

/** Get a single trend by id */
export function getTrend(id) {
  return readLocalTrends().find((t) => t.id === id) || null;
}

/** Get count stats for the dashboard */
export function getTrendStats() {
  const trends = readLocalTrends();
  const cutoff24h = Date.now() - 86400000;
  return {
    total: trends.length,
    last24h: trends.filter((t) => new Date(t.fetchedAt).getTime() >= cutoff24h).length,
    undrafted: trends.filter((t) => !t.drafted).length,
    highScore: trends.filter((t) => (t.relevanceScore || 0) >= 70).length,
  };
}
