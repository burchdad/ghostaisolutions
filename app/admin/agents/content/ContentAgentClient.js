"use client";

import { useState } from "react";

export default function ContentAgentClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runTrigger = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/admin/agents/content/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.details || payload?.error || "Content trigger failed");
      }

      setResult(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
      <h2 className="text-lg font-semibold text-white">Manual Trigger</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={runTrigger}
          disabled={loading}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating..." : "Run Content Trigger"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-300/40 bg-red-300/10 p-4">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-4">
          <p className="font-semibold text-emerald-100">Content trigger response received.</p>
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs text-emerald-50">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
