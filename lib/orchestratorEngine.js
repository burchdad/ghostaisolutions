import { getTrendStats } from "@/lib/trendStore";
import { getOrchestratorState, saveOrchestratorState, setCycleMeta } from "@/lib/orchestratorStore";

export const ORCHESTRATOR_TASKS = [
  {
    key: "trends",
    name: "Trend Refresh",
    path: "/api/agents/trends/cron",
    method: "POST",
    baseIntervalMinutes: 120,
    minIntervalMinutes: 30,
    maxIntervalMinutes: 360,
  },
  {
    key: "content",
    name: "Content Trigger",
    path: "/api/agents/content/trigger",
    method: "POST",
    baseIntervalMinutes: 360,
    minIntervalMinutes: 120,
    maxIntervalMinutes: 720,
  },
  {
    key: "social",
    name: "Social Trigger",
    path: "/api/agents/social/trigger",
    method: "POST",
    baseIntervalMinutes: 180,
    minIntervalMinutes: 60,
    maxIntervalMinutes: 360,
  },
  {
    key: "newsletter",
    name: "Newsletter Digest",
    path: "/api/agents/newsletter/cron",
    method: "GET",
    baseIntervalMinutes: 10080,
    minIntervalMinutes: 2880,
    maxIntervalMinutes: 10080,
  },
  {
    key: "competitors",
    name: "Competitor Scan",
    path: "/api/agents/competitors/cron",
    method: "GET",
    baseIntervalMinutes: 10080,
    minIntervalMinutes: 2880,
    maxIntervalMinutes: 10080,
  },
];

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toMillis(minutes) {
  return minutes * 60000;
}

function computePressure(trendStats = {}) {
  const total = Number(trendStats.total || 0);
  const last24h = Number(trendStats.last24h || 0);
  const highScore = Number(trendStats.highScore || 0);
  const undrafted = Number(trendStats.undrafted || 0);

  if (total === 0) {
    return {
      label: "cold",
      multiplier: 1.2,
      reason: "No trend signals yet. Running in low-frequency calibration mode.",
    };
  }

  const pressureScore = highScore * 14 + last24h * 4 + undrafted * 2;

  if (pressureScore >= 220 || highScore >= 8 || last24h >= 20) {
    return {
      label: "hot",
      multiplier: 0.5,
      reason: "High trend velocity detected. Accelerating content and social loops.",
    };
  }

  if (pressureScore >= 110 || highScore >= 4 || last24h >= 10) {
    return {
      label: "warm",
      multiplier: 0.75,
      reason: "Moderate trend activity. Running at elevated cadence.",
    };
  }

  return {
    label: "steady",
    multiplier: 1,
    reason: "Stable trend conditions. Running default cadence.",
  };
}

function buildTaskPlan(trendStats) {
  const pressure = computePressure(trendStats);
  const schedule = {};

  for (const task of ORCHESTRATOR_TASKS) {
    const interval = clamp(
      Math.round(task.baseIntervalMinutes * pressure.multiplier),
      task.minIntervalMinutes,
      task.maxIntervalMinutes
    );

    schedule[task.key] = {
      intervalMinutes: interval,
      pressureLabel: pressure.label,
      pressureReason: pressure.reason,
    };
  }

  return { pressure, schedule };
}

function isDue(lastRunAt, intervalMinutes, nowMs) {
  if (!lastRunAt) return true;
  return nowMs - new Date(lastRunAt).getTime() >= toMillis(intervalMinutes);
}

function nextDueIso(lastRunAt, intervalMinutes, nowMs) {
  if (!lastRunAt) return new Date(nowMs).toISOString();
  return new Date(new Date(lastRunAt).getTime() + toMillis(intervalMinutes)).toISOString();
}

export function getAdaptivePlan() {
  const trendStats = getTrendStats();
  const { pressure, schedule } = buildTaskPlan(trendStats);
  return { trendStats, pressure, schedule, tasks: ORCHESTRATOR_TASKS };
}

export async function runAdaptiveCycle({
  baseUrl,
  triggerSecret,
  dryRun = false,
  forceTask = null,
  source = "unknown",
} = {}) {
  const normalizedBaseUrl = (baseUrl || "").replace(/\/$/, "");
  const state = getOrchestratorState();
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const { trendStats, pressure, schedule } = getAdaptivePlan();

  const results = [];

  for (const task of ORCHESTRATOR_TASKS) {
    const taskState = state.tasks?.[task.key] || {};
    const intervalMinutes = schedule[task.key].intervalMinutes;
    const due = forceTask ? forceTask === task.key : isDue(taskState.lastRunAt, intervalMinutes, nowMs);

    if (!due) {
      results.push({
        task: task.key,
        name: task.name,
        status: "skipped",
        reason: "Not due yet",
        intervalMinutes,
        lastRunAt: taskState.lastRunAt || null,
        nextDueAt: nextDueIso(taskState.lastRunAt, intervalMinutes, nowMs),
      });
      continue;
    }

    if (dryRun) {
      results.push({
        task: task.key,
        name: task.name,
        status: "due",
        reason: "Dry run",
        intervalMinutes,
        lastRunAt: taskState.lastRunAt || null,
        nextDueAt: nextDueIso(nowIso, intervalMinutes, nowMs),
      });
      continue;
    }

    if (!normalizedBaseUrl || !triggerSecret) {
      results.push({
        task: task.key,
        name: task.name,
        status: "failed",
        reason: "Missing AUTOMATION_INTERNAL_BASE_URL or CRON_SECRET",
        intervalMinutes,
      });
      continue;
    }

    const started = Date.now();
    let ok = false;
    let responseCode = null;
    let summary = "";

    try {
      const response = await fetch(`${normalizedBaseUrl}${task.path}`, {
        method: task.method,
        headers: {
          Authorization: `Bearer ${triggerSecret}`,
          "Content-Type": "application/json",
          "X-Orchestrator-Source": source,
        },
        body: task.method === "POST" ? JSON.stringify({ source }) : undefined,
      });
      responseCode = response.status;

      const responseText = await response.text();
      const payload = safeJsonParse(responseText);
      ok = response.ok;
      summary = payload?.message || payload?.error || (ok ? "ok" : "request failed");

      results.push({
        task: task.key,
        name: task.name,
        status: ok ? "success" : "failed",
        responseCode,
        summary,
        intervalMinutes,
        durationMs: Date.now() - started,
        payload,
      });
    } catch (error) {
      summary = error.message;
      results.push({
        task: task.key,
        name: task.name,
        status: "failed",
        responseCode,
        summary,
        intervalMinutes,
        durationMs: Date.now() - started,
      });
    }
  }

  if (!dryRun) {
    for (const result of results) {
      if (result.status !== "success" && result.status !== "failed") continue;
      const prev = state.tasks[result.task] || {};
      const nextDueAt = nextDueIso(nowIso, result.intervalMinutes, nowMs);
      state.tasks[result.task] = {
        ...prev,
        lastRunAt: nowIso,
        lastStatus: result.status,
        lastSummary: result.summary || "",
        lastResponseCode: result.responseCode,
        lastDurationMs: result.durationMs || null,
        intervalMinutes: result.intervalMinutes,
        nextDueAt,
      };
    }

    state.lastCycleAt = nowIso;
    state.lastCycleSource = source;
    saveOrchestratorState(state);
    setCycleMeta({ source, at: nowIso });
  }

  return {
    success: results.every((r) => r.status !== "failed"),
    source,
    dryRun,
    forcedTask: forceTask || null,
    baseUrl: normalizedBaseUrl || null,
    pressure,
    trendStats,
    results,
  };
}
