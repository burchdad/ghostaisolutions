"use client";
import { useEffect, useRef, useState } from "react";

export default function FloatingBot({
  src = "https://ghostbot-chat.vercel.app/?embed=1&theme=dark",
  title = "Ghostbot",
}) {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!panelRef.current) return;
      const btn = document.getElementById("ghostbot-trigger");
      const clickedTrigger = btn && btn.contains(e.target);
      const clickedPanel = panelRef.current.contains(e.target);
      if (!clickedTrigger && !clickedPanel) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <>
      <button
        id="ghostbot-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[99998] inline-flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg border border-white/10 bg-brand-600 text-white hover:bg-brand-700"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M20 2H4a2 2 0 00-2 2v17l4-3h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
        </svg>
      </button>

      <div
        id="ghostbot-widget"
        ref={panelRef}
        className={`fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-[99997] w-[320px] sm:w-[400px] h-[500px] sm:h-[600px] rounded-xl shadow-lg bg-transparent transform transition-all duration-300 ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
      >
        <div className="flex flex-col h-full rounded-xl overflow-hidden border border-white/10 bg-slate-900">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-brand-600">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M12 2C7.58 2 4 5.58 4 10v7a1 1 0 0 0 1.58.81l1.84-1.38a1 1 0 0 1 1.2 0l1.84 1.38a1 1 0 0 0 1.2 0l1.84-1.38a1 1 0 0 1 1.2 0l1.84 1.38A1 1 0 0 0 20 17v-7c0-4.42-3.58-8-8-8Z" />
                </svg>
              </span>
              <span className="text-sm font-semibold">{title}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings((s) => !s)}
                className="rounded-md border border-white/10 px-2 py-1 text-xs hover:bg-white/10"
              >
                Settings
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-white/10 px-2 py-1 text-xs hover:bg-white/10"
                aria-label="Close chat"
              >
                Close
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="bg-slate-800 text-white text-sm p-3 border-b border-white/10">
              <div className="py-1">🔈 Turn off sound (coming soon)</div>
              <div className="py-1">🌐 Change language (coming soon)</div>
              <div className="py-1">📧 Email transcript (coming soon)</div>
              <div className="py-1 cursor-pointer text-red-400 hover:underline" onClick={() => {
                localStorage.removeItem("chat_history");
                alert("Chat history cleared");
              }}>🗑️ Clear chat history</div>
            </div>
          )}

          <iframe
            src={src}
            title="Ghostbot"
            className="w-full h-full"
            allow="clipboard-write; microphone; camera"
            style={{ border: 0, background: "transparent" }}
          />
        </div>
      </div>
    </>
  );
}
