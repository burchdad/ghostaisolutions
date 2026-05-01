/**
 * Editorial Calendar Store
 * Persists content calendar entries to .internal/editorial/
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";

const DIR = path.join(process.cwd(), ".internal", "editorial");
const CALENDAR_FILE = path.join(DIR, "calendar.json");
const THEMES_FILE = path.join(DIR, "themes.json");

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

function makeId(prefix = "entry") {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`;
}

// ─── Calendar Entries ─────────────────────────────────────────────────────────

export function listCalendarEntries({ weekStart, weekEnd } = {}) {
  const all = readJson(CALENDAR_FILE);
  if (!weekStart) return all.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  return all
    .filter((e) => {
      const d = new Date(e.scheduledDate);
      return d >= new Date(weekStart) && d <= new Date(weekEnd);
    })
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
}

export function createCalendarEntry(data) {
  const all = readJson(CALENDAR_FILE);
  const entry = {
    id: makeId(),
    createdAt: nowIso(),
    status: "planned", // planned | in-progress | published | skipped
    ...data,
  };
  all.push(entry);
  writeJson(CALENDAR_FILE, all);
  return entry;
}

export function updateCalendarEntry(id, patch) {
  const all = readJson(CALENDAR_FILE);
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, updatedAt: nowIso() };
  writeJson(CALENDAR_FILE, all);
  return all[idx];
}

export function deleteCalendarEntry(id) {
  const all = readJson(CALENDAR_FILE);
  writeJson(CALENDAR_FILE, all.filter((e) => e.id !== id));
}

export function bulkCreateEntries(entries) {
  const all = readJson(CALENDAR_FILE);
  const created = entries.map((data) => ({
    id: makeId(),
    createdAt: nowIso(),
    status: "planned",
    ...data,
  }));
  writeJson(CALENDAR_FILE, [...all, ...created]);
  return created;
}

// ─── Themes ───────────────────────────────────────────────────────────────────

export function listThemes() {
  return readJson(THEMES_FILE);
}

export function saveTheme(theme) {
  const all = readJson(THEMES_FILE);
  const idx = all.findIndex((t) => t.id === theme.id);
  if (idx !== -1) { all[idx] = { ...all[idx], ...theme, updatedAt: nowIso() }; }
  else { all.push({ id: makeId("theme"), createdAt: nowIso(), ...theme }); }
  writeJson(THEMES_FILE, all);
}

export function getCalendarStats() {
  const all = readJson(CALENDAR_FILE);
  const now = new Date();
  const thisWeekEnd = new Date(now); thisWeekEnd.setDate(now.getDate() + 7);
  return {
    total: all.length,
    thisWeek: all.filter((e) => new Date(e.scheduledDate) >= now && new Date(e.scheduledDate) <= thisWeekEnd).length,
    planned: all.filter((e) => e.status === "planned").length,
    published: all.filter((e) => e.status === "published").length,
  };
}
