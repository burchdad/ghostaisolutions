"use client";

import { useMemo, useState } from "react";

export default function MetaConnectionPanel({ connected, orgId, profile, assets, status, message }) {
  const [disconnecting, setDisconnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [localMessage, setLocalMessage] = useState("");
  const [localError, setLocalError] = useState("");

  const connectHref = useMemo(() => {
    const params = new URLSearchParams({ orgId, next: "/admin/agents/social/facebook" });
    return `/api/meta/oauth/start?${params.toString()}`;
  }, [orgId]);

  async function handleDisconnect() {
    setDisconnecting(true);
    setLocalError("");
    setLocalMessage("");

    try {
      const response = await fetch("/api/meta/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to disconnect Meta account");
      }

      setLocalMessage("Meta account disconnected. Refreshing...");
      window.location.href = "/admin/agents/social/facebook?status=disconnected";
    } catch (error) {
      setLocalError(error?.message || "Failed to disconnect Meta account");
    } finally {
      setDisconnecting(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    setLocalError("");
    setLocalMessage("");

    try {
      const response = await fetch("/api/meta/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to refresh Meta token");
      }

      setLocalMessage("Meta token refreshed. Refreshing page...");
      window.location.href = "/admin/agents/social/facebook?status=refreshed";
    } catch (error) {
      setLocalError(error?.message || "Failed to refresh Meta token");
    } finally {
      setRefreshing(false);
    }
  }

  const summary = [
    { label: "Pages", value: assets?.pages?.length || 0 },
    { label: "Instagram", value: assets?.instagramAccounts?.length || 0 },
    { label: "Ad Accounts", value: assets?.adAccounts?.length || 0 },
    { label: "Business Managers", value: assets?.businessManagers?.length || 0 },
  ];

  return (
    <div className="space-y-6">
      {(status || message || localMessage || localError) ? (
        <div
          className={`rounded-2xl border p-4 text-sm ${
            localError || status === "error"
              ? "border-red-300/30 bg-red-300/10 text-red-100"
              : "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
          }`}
        >
          {localError || message || localMessage || (status === "connected" ? "Meta account connected successfully." : "Status updated.")}
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Business Login</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Connect Meta Account</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Connect a Meta business account to sync Facebook Pages, Instagram Business Accounts, Ad Accounts, and Business Manager assets into Ghost.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={connectHref}
              className="inline-flex items-center rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              {connected ? "Reconnect Meta" : "Connect Meta Account"}
            </a>
            {connected ? (
              <>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-60"
                >
                  {refreshing ? "Refreshing..." : "Refresh Token"}
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="inline-flex items-center rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-60"
                >
                  {disconnecting ? "Disconnecting..." : "Disconnect"}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <article key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-center">
            <p className="text-2xl font-bold text-white">{item.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
          </article>
        ))}
      </div>

      {profile ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <h3 className="text-lg font-semibold text-white">Connected Profile</h3>
          <p className="mt-3 text-sm text-slate-300">{profile.name || "Meta User"}</p>
          <p className="mt-1 text-xs font-mono text-slate-400">{profile.id}</p>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <AssetList title="Facebook Pages" items={assets?.pages || []} emptyLabel="No Pages connected yet." renderItem={(page) => (
          <>
            <p className="font-semibold text-white">{page.name}</p>
            <p className="mt-1 text-xs text-slate-400">{page.id}</p>
            {page.category ? <p className="mt-2 text-sm text-slate-300">Category: {page.category}</p> : null}
          </>
        )} />

        <AssetList title="Instagram Business Accounts" items={assets?.instagramAccounts || []} emptyLabel="No Instagram Business Accounts detected." renderItem={(account) => (
          <>
            <p className="font-semibold text-white">{account.username || "Instagram Account"}</p>
            <p className="mt-1 text-xs text-slate-400">{account.id}</p>
          </>
        )} />

        <AssetList title="Ad Accounts" items={assets?.adAccounts || []} emptyLabel="No Ad Accounts detected." renderItem={(account) => (
          <>
            <p className="font-semibold text-white">{account.name || account.id}</p>
            <p className="mt-1 text-xs text-slate-400">{account.id}</p>
            {account.currency ? <p className="mt-2 text-sm text-slate-300">Currency: {account.currency}</p> : null}
          </>
        )} />

        <AssetList title="Business Managers" items={assets?.businessManagers || []} emptyLabel="No Business Managers detected." renderItem={(business) => (
          <>
            <p className="font-semibold text-white">{business.name || business.id}</p>
            <p className="mt-1 text-xs text-slate-400">{business.id}</p>
            {business.verificationStatus ? <p className="mt-2 text-sm text-slate-300">Verification: {business.verificationStatus}</p> : null}
          </>
        )} />
      </div>
    </div>
  );
}

function AssetList({ title, items, renderItem, emptyLabel }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.length ? (
          items.map((item) => (
            <article key={item.id} className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
              {renderItem(item)}
            </article>
          ))
        ) : (
          <p className="text-sm text-slate-400">{emptyLabel}</p>
        )}
      </div>
    </div>
  );
}
