"use client";
import { useEffect, useRef, useState } from "react";

export default function FloatingBot({
  // switch source here: external app OR your internal minimal embed
  src = "https://ghostbot-chat.vercel.app/?mode=embed", // try adding ?mode=embed on your app to hide its own bubble (if supported)
  // src = "/embed", // ← use this if you prefer your internal minimal chat UI
  title = "Ghostbot",
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // close when clicking outside the panel (but not the button)
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target)) {
        // only close if click is not on the chat button
        const btn = document.getElementById("ghostbot-trigger");
        if (btn && btn.contains(e.target)) return;
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <>
      {/* trigger bubble */}
      <button
        id="ghostbot-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat"
        className="fixed bottom-4 right-4 z-[99998] sm:bottom-6 sm:right-6
                   inline-flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14
                   rounded-full shadow-lg border border-white/10
                   bg-brand-600 text-white hover:bg-brand-700"
      >
        {/* chat icon */}
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M20 2H4a2 2 0 00-2 2v17l4-3h14a2 2 0 002-2V4a2 2 0 00-2-2z"/>
        </svg>
      </button>

      {/* panel */}
      <div
        className={`fixed z-[99999] transition-all duration-200
                    ${open ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none translate-y-2"}`}
        style={{
          right: "1rem",
          bottom: "5rem",
        }}
      >
        <div
          ref={panelRef}
          className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl
                     bg-white dark:bg-slate-900"
          style={{
            // responsive sizing
            width: "min(92vw, 380px)",
            height: "min(75vh, 560px)",
          }}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-brand-600 text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M12 2C7.58 2 4 5.58 4 10v7a1 1 0 0 0 1.58.81l1.84-1.38a1 1 0 0 1 1.2 0l1.84 1.38a1 1 0 0 0 1.2 0l1.84-1.38a1 1 0 0 1 1.2 0l1.84 1.38A1 1 0 0 0 20 17v-7c0-4.42-3.58-8-8-8Z"/>
                </svg>
              </span>
              <span className="text-sm font-semibold">{title}</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-md border px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </div>

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
