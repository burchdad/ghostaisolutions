import fs from "fs";
import path from "path";

const BASE_INTERNAL_DIR = process.env.VERCEL ? path.join("/tmp", ".internal") : path.join(process.cwd(), ".internal");
const DIR = path.join(BASE_INTERNAL_DIR, "orchestrator");
const STATE_FILE = path.join(DIR, "state.json");

const DEFAULT_TASKS = {
  trends: {},
  content: {},
  social: {},
  newsletter: {},
  competitors: {},
};

function ensureDir() {
  try {
    if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
  } catch {
    return false;
  }
  return true;
}

function readJson(filePath, fallback) {
  if (!ensureDir()) return fallback;
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  if (!ensureDir()) return;
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

function nowIso() {
  return new Date().toISOString();
}

function withDefaults(state) {
  return {
    createdAt: state?.createdAt || nowIso(),
    updatedAt: nowIso(),
    lastCycleAt: state?.lastCycleAt || null,
    lastCycleSource: state?.lastCycleSource || null,
    tasks: {
      ...DEFAULT_TASKS,
      ...(state?.tasks || {}),
    },
  };
}

export function getOrchestratorState() {
  return withDefaults(readJson(STATE_FILE, null));
}

export function saveOrchestratorState(state) {
  writeJson(STATE_FILE, withDefaults(state));
}

export function setCycleMeta({ source = "unknown", at = nowIso() } = {}) {
  const state = getOrchestratorState();
  state.lastCycleAt = at;
  state.lastCycleSource = source;
  saveOrchestratorState(state);
  return state;
}

export function updateTaskState(taskKey, patch = {}) {
  const state = getOrchestratorState();
  const prev = state.tasks[taskKey] || {};
  state.tasks[taskKey] = {
    ...prev,
    ...patch,
    updatedAt: nowIso(),
  };
  saveOrchestratorState(state);
  return state.tasks[taskKey];
}
