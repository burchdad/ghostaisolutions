/**
 * Newsletter Store
 * Persists subscribers and campaigns to .internal/newsletter/
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";

const BASE_INTERNAL_DIR = process.env.VERCEL ? path.join("/tmp", ".internal") : path.join(process.cwd(), ".internal");
const DIR = path.join(BASE_INTERNAL_DIR, "newsletter");
const SUBSCRIBERS_FILE = path.join(DIR, "subscribers.json");
const CAMPAIGNS_FILE = path.join(DIR, "campaigns.json");
const SEQUENCES_FILE = path.join(DIR, "sequences.json");

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

function makeId(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`;
}

// ─── Subscribers ──────────────────────────────────────────────────────────────

export function listSubscribers() {
  return readJson(SUBSCRIBERS_FILE);
}

export function upsertSubscriber({ email, name = "", source = "manual", tags = [] }) {
  const all = readJson(SUBSCRIBERS_FILE);
  const idx = all.findIndex((s) => s.email.toLowerCase() === email.toLowerCase());
  if (idx !== -1) {
    all[idx].updatedAt = nowIso();
    all[idx].tags = [...new Set([...all[idx].tags, ...tags])];
    writeJson(SUBSCRIBERS_FILE, all);
    return { subscriber: all[idx], created: false };
  }
  const sub = {
    id: makeId("sub"),
    email,
    name,
    source,
    tags,
    status: "active",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    emailsSent: 0,
    lastEmailAt: null,
  };
  all.push(sub);
  writeJson(SUBSCRIBERS_FILE, all);
  return { subscriber: sub, created: true };
}

export function updateSubscriber(id, patch) {
  const all = readJson(SUBSCRIBERS_FILE);
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, updatedAt: nowIso() };
  writeJson(SUBSCRIBERS_FILE, all);
  return all[idx];
}

export function getSubscriberStats() {
  const all = readJson(SUBSCRIBERS_FILE);
  return {
    total: all.length,
    active: all.filter((s) => s.status === "active").length,
    unsubscribed: all.filter((s) => s.status === "unsubscribed").length,
  };
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export function listCampaigns() {
  return readJson(CAMPAIGNS_FILE).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function createCampaign(data) {
  const all = readJson(CAMPAIGNS_FILE);
  const campaign = {
    id: makeId("camp"),
    createdAt: nowIso(),
    status: "draft",
    sentAt: null,
    sentCount: 0,
    ...data,
  };
  all.push(campaign);
  writeJson(CAMPAIGNS_FILE, all);
  return campaign;
}

export function updateCampaign(id, patch) {
  const all = readJson(CAMPAIGNS_FILE);
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, updatedAt: nowIso() };
  writeJson(CAMPAIGNS_FILE, all);
  return all[idx];
}

export function getCampaign(id) {
  return readJson(CAMPAIGNS_FILE).find((c) => c.id === id) || null;
}

// ─── Drip Sequences ───────────────────────────────────────────────────────────

export function listSequences() {
  return readJson(SEQUENCES_FILE);
}

export function saveSequence(sequence) {
  const all = readJson(SEQUENCES_FILE);
  const idx = all.findIndex((s) => s.id === sequence.id);
  if (idx !== -1) { all[idx] = { ...all[idx], ...sequence, updatedAt: nowIso() }; }
  else { all.push({ ...sequence, id: sequence.id || makeId("seq"), createdAt: nowIso(), updatedAt: nowIso() }); }
  writeJson(SEQUENCES_FILE, all);
}

export function getCampaignStats() {
  const campaigns = readJson(CAMPAIGNS_FILE);
  const sent = campaigns.filter((c) => c.status === "sent");
  return {
    total: campaigns.length,
    sent: sent.length,
    draft: campaigns.filter((c) => c.status === "draft").length,
    totalSent: sent.reduce((n, c) => n + (c.sentCount || 0), 0),
  };
}
