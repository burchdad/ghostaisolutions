/**
 * Competitor Intelligence Store
 * Persists competitor profiles and weekly scans to .internal/competitors/
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";

const BASE_INTERNAL_DIR = process.env.VERCEL ? path.join("/tmp", ".internal") : path.join(process.cwd(), ".internal");
const DIR = path.join(BASE_INTERNAL_DIR, "competitors");
const COMPETITORS_FILE = path.join(DIR, "competitors.json");
const SCANS_FILE = path.join(DIR, "scans.json");

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

// ─── Competitors ──────────────────────────────────────────────────────────────

export function listCompetitors() {
  return readJson(COMPETITORS_FILE);
}

export function upsertCompetitor({ name, domain, linkedinUrl = "", twitterHandle = "", notes = "" }) {
  const all = readJson(COMPETITORS_FILE);
  const idx = all.findIndex((c) => c.domain === domain || c.name.toLowerCase() === name.toLowerCase());
  if (idx !== -1) {
    all[idx] = { ...all[idx], name, domain, linkedinUrl, twitterHandle, notes, updatedAt: nowIso() };
    writeJson(COMPETITORS_FILE, all);
    return { competitor: all[idx], created: false };
  }
  const comp = { id: makeId(), createdAt: nowIso(), updatedAt: nowIso(), name, domain, linkedinUrl, twitterHandle, notes, lastScannedAt: null };
  all.push(comp);
  writeJson(COMPETITORS_FILE, all);
  return { competitor: comp, created: true };
}

export function getCompetitor(id) {
  return readJson(COMPETITORS_FILE).find((c) => c.id === id) || null;
}

export function updateCompetitor(id, patch) {
  const all = readJson(COMPETITORS_FILE);
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, updatedAt: nowIso() };
  writeJson(COMPETITORS_FILE, all);
  return all[idx];
}

export function removeCompetitor(id) {
  writeJson(COMPETITORS_FILE, readJson(COMPETITORS_FILE).filter((c) => c.id !== id));
}

// ─── Scans ────────────────────────────────────────────────────────────────────

export function listScans({ limit = 20 } = {}) {
  return readJson(SCANS_FILE)
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

export function getCompetitorStats() {
  const competitors = readJson(COMPETITORS_FILE);
  const scans = readJson(SCANS_FILE);
  const lastScan = scans[0]?.scannedAt || null;
  return { total: competitors.length, scans: scans.length, lastScan };
}
