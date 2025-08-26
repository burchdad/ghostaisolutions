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

  const clearChatHistory = () => {
    sessionStorage.removeItem("chat_history");
    const iframe = document.querySelector("iframe");
    iframe?.contentWindow?.postMessage("ghostbot-clear-history", "*");
    alert("Chat history cleared");
    setShowSettings(false);
  };

  return (
    <>
      <button
        id="ghostbot-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[99998]
                   inline-flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14
                   rounded-full shadow-lg border border-white/10
                   bg-brand-600 text-white hover:bg-brand-700"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M20 2H4a2 2 0 00-2 2v17l4-3h14a2 2 0 002-2V4a2 2 0 00-2-2z"/>
        </svg>
      </button>

      <div
        id="ghostbot-widget"
        ref={panelRef}
        className={`fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-[99997]
                   w-[320px] sm:w-[400px] h-[500px] sm:h-[600px]
                   rounded-xl shadow-lg
                   bg-transparent
                   transform transition-all duration-300
                   ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
      >
        <iframe
  src={src}
  title="Ghostbot"
  className="w-full h-full rounded-xl shadow-xl border-none"
  allow="clipboard-write; microphone; camera"
  style={{ background: "transparent" }}

            />
        <button
          onClick={() => setShowSettings((prev) => !prev)}
          className="text-xs hover:underline"
        >
          Settings
        </button>
              <button
                onClick={() => setOpen(false)}
                className="text-xs hover:underline"
              >
                Close
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="text-sm text-white bg-slate-900 border-b border-white/10 p-3">
              <div className="mb-2">⚙️ <strong>Settings</strong></div>
              <ul className="space-y-1">
                <li className="opacity-50">🔈 Turn off sound (coming soon)</li>
                <li className="opacity-50">🌐 Change language (coming soon)</li>
                <li className="opacity-50">📧 Email transcript (coming soon)</li>
                <li>
                  🧹 <button onClick={clearChatHistory} className="text-red-400 underline">Clear chat history</button>
                </li>
              </ul>
            </div>
          )}

          <iframe
  src={src}
  title="Ghostbot"
  className="w-full h-full rounded-xl shadow-xl border-none"
  allow="clipboard-write; microphone; camera"
  style={{ background: "transparent" }}
/>
        </div>
      </div>
    </>
  );
}
