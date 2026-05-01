"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error(payload?.error || `Request failed (${res.status})`);
  return payload;
}

const PRESSURE_STYLES = {
  hot: "border-rose-300/40 bg-rose-300/10 text-rose-200",
  warm: "border-amber-300/40 bg-amber-300/10 text-amber-200",
  steady: "border-cyan-300/40 bg-cyan-300/10 text-cyan-200",
  cold: "border-slate-300/30 bg-slate-300/10 text-slate-300",
};

function formatRelative(iso) {
  if (!iso) return "Never";
  const ms = new Date(iso).getTime() - Date.now();
  const absMin = Math.round(Math.abs(ms) / 60000);
  if (absMin < 60) return `${ms >= 0 ? "in" : ""} ${absMin}m ${ms < 0 ? "ago" : ""}`.trim();
  const absH = Math.round(absMin / 60);
  if (absH < 48) return `${ms >= 0 ? "in" : ""} ${absH}h ${ms < 0 ? "ago" : ""}`.trim();
  const absD = Math.round(absH / 24);
  return `${ms >= 0 ? "in" : ""} ${absD}d ${ms < 0 ? "ago" : ""}`.trim();
}

export default function OrchestratorClient({ initialPlan, initialState, triggerEndpoint }) {
  const [plan, setPlan] = useState(initialPlan);
  const [state, setState] = useState(initialState);
  const [running, setRunning] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState("");
  const [lastRun, setLastRun] = useState(null);
  const [selectedTask, setSelectedTask] = useState("all");

  const taskRows = useMemo(() => {
    const schedule = plan?.schedule || {};
    const taskDefs = plan?.tasks || [];
    const taskState = state?.tasks || {};
    return taskDefs.map((task) => ({
      key: task.key,
      name: task.name,
      path: task.path,
      intervalMinutes: schedule[task.key]?.intervalMinutes || task.baseIntervalMinutes,
      pressureLabel: schedule[task.key]?.pressureLabel || "steady",
      lastRunAt: taskState[task.key]?.lastRunAt || null,
      nextDueAt: taskState[task.key]?.nextDueAt || null,
      lastStatus: taskState[task.key]?.lastStatus || "-",
      lastSummary: taskState[task.key]?.lastSummary || "",
    }));
  }, [plan, state]);

  async function refresh() {
    const payload = await apiFetch("/api/agents/orchestrator");
    setPlan(payload.plan);
    setState(payload.state);
  }

  async function analyze() {
    setAnalyzing(true);
    setMessage("");
    try {
      const payload = await apiFetch("/api/agents/orchestrator", {
        method: "POST",
        body: JSON.stringify({ action: "analyze" }),
      });
      setPlan(payload.plan);
      setState(payload.state);
      setMessage("Adaptive timing updated from current trend signals.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function runNow({ dryRun = false } = {}) {
    setRunning(true);
    setMessage("");
    setLastRun(null);
    try {
      const body = {
        action: "run-now",
        dryRun,
        task: selectedTask === "all" ? null : selectedTask,
      };
      const payload = await apiFetch("/api/agents/orchestrator", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setLastRun(payload);
      await refresh();
      setMessage(dryRun ? "Dry run complete." : "Adaptive cycle complete.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setRunning(false);
    }
  }

  const pressureLabel = plan?.pressure?.label || "steady";

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Agent Hub</p>
            <h1 className="mt-1 text-3xl font-bold text-white">Orchestrator Agent</h1>
            <p className="mt-2 text-sm text-slate-300">Railway calls one trigger endpoint. This agent decides what should run and when based on trend pressure.</p>
          </div>
          <Link href="/admin/agents" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-300/40 hover:text-white">← Agent Hub</Link>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-2xl font-bold text-white">{plan?.trendStats?.total ?? 0}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">Total Trends</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-2xl font-bold text-white">{plan?.trendStats?.last24h ?? 0}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">Last 24h Signals</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-2xl font-bold text-white">{plan?.trendStats?.highScore ?? 0}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">High Score Trends</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs uppercase tracking-[0.12em] ${PRESSURE_STYLES[pressureLabel] || PRESSURE_STYLES.steady}`}>{pressureLabel}</span>
            <p className="mt-2 text-xs text-slate-400">{plan?.pressure?.reason || "Adaptive mode active."}</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-300/40 focus:outline-none"
            >
              <option value="all">All Due Tasks</option>
              {taskRows.map((task) => <option key={task.key} value={task.key}>{task.name}</option>)}
            </select>
            <button onClick={() => runNow({ dryRun: false })} disabled={running} className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-40">{running ? "Running…" : "Run Adaptive Cycle"}</button>
            <button onClick={() => runNow({ dryRun: true })} disabled={running} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-cyan-300/40 hover:text-white disabled:opacity-40">Dry Run</button>
            <button onClick={analyze} disabled={analyzing} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-cyan-300/40 hover:text-white disabled:opacity-40">{analyzing ? "Analyzing…" : "Recalculate Timing"}</button>
            <p className="text-xs text-slate-500">Railway trigger path: {triggerEndpoint}</p>
          </div>
          {message && <p className="mt-3 text-sm text-cyan-300">{message}</p>}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {taskRows.map((task) => (
            <article key={task.key} className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-white">{task.name}</h2>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${PRESSURE_STYLES[task.pressureLabel] || PRESSURE_STYLES.steady}`}>{task.pressureLabel}</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">{task.path}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
                <p>Interval: {task.intervalMinutes} min</p>
                <p>Last status: {task.lastStatus}</p>
                <p>Last run: {task.lastRunAt ? new Date(task.lastRunAt).toLocaleString() : "Never"}</p>
                <p>Next due: {task.nextDueAt ? formatRelative(task.nextDueAt) : "Immediate"}</p>
              </div>
              {task.lastSummary && <p className="mt-3 text-xs text-slate-500">{task.lastSummary}</p>}
            </article>
          ))}
        </div>

        {lastRun?.results?.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Last Execution Result</p>
            <div className="mt-3 space-y-2">
              {lastRun.results.map((r) => (
                <div key={`${r.task}-${r.status}-${r.responseCode || 0}`} className="rounded-xl border border-white/10 bg-slate-900/40 p-3 text-xs text-slate-300">
                  <p className="font-semibold text-white">{r.name}: {r.status}</p>
                  <p>{r.summary || r.reason || "-"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
