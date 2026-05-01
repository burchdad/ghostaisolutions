/**
 * Engagement Store
 * Persists social listening opportunities to .internal/engagement/
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";

const DIR = path.join(process.cwd(), ".internal", "engagement");
const OPPS_FILE = path.join(DIR, "opportunities.json");
const REPLIED_FILE = path.join(DIR, "replied.json");

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

function makeId() {
  return `opp-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`;
}

export function listOpportunities({ status } = {}) {
  const all = readJson(OPPS_FILE);
  if (status) return all.filter((o) => o.status === status);
  return all.sort((a, b) => new Date(b.foundAt) - new Date(a.foundAt));
}

export function upsertOpportunity(item) {
  if (!item.sourceUrl) return null;
  const all = readJson(OPPS_FILE);
  const idx = all.findIndex((o) => o.sourceUrl === item.sourceUrl);
  if (idx !== -1) return all[idx]; // already tracked
  const opp = {
    id: makeId(),
    foundAt: nowIso(),
    status: "pending", // pending | drafted | replied | dismissed
    draftReply: null,
    repliedAt: null,
    ...item,
  };
  all.unshift(opp);
  // keep last 200
  writeJson(OPPS_FILE, all.slice(0, 200));
  return opp;
}

export function updateOpportunity(id, patch) {
  const all = readJson(OPPS_FILE);
  const idx = all.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, updatedAt: nowIso() };
  writeJson(OPPS_FILE, all);
  return all[idx];
}

export function getEngagementStats() {
  const all = readJson(OPPS_FILE);
  return {
    total: all.length,
    pending: all.filter((o) => o.status === "pending").length,
    drafted: all.filter((o) => o.status === "drafted").length,
    replied: all.filter((o) => o.status === "replied").length,
    dismissed: all.filter((o) => o.status === "dismissed").length,
  };
}

export function pruneOldOpportunities(days = 14) {
  const cutoff = Date.now() - days * 86400000;
  const all = readJson(OPPS_FILE);
  const fresh = all.filter((o) => new Date(o.foundAt).getTime() >= cutoff || o.status === "replied");
  writeJson(OPPS_FILE, fresh);
  return all.length - fresh.length;
}
