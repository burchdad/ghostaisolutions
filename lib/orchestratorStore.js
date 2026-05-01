import fs from "fs";
import path from "path";

const DIR = path.join(process.cwd(), ".internal", "orchestrator");
const STATE_FILE = path.join(DIR, "state.json");

const DEFAULT_TASKS = {
  trends: {},
  content: {},
  social: {},
  newsletter: {},
  competitors: {},
};

function ensureDir() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
}

function readJson(filePath, fallback) {
  ensureDir();
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  ensureDir();
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
