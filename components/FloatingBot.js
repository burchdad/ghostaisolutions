"use client";

export default function FloatingBot() {
  // Toggle drawer state
  const openPanel = () => {
    const panel = document.getElementById("ghostbot-panel");
    if (panel) panel.style.display = panel.style.display === "none" ? "flex" : "none";
  };

  // Inject panel once
  if (typeof window !== "undefined" && !document.getElementById("ghostbot-panel")) {
    const panel = document.createElement("div");
    panel.id = "ghostbot-panel";
    panel.style.cssText = "position:fixed;bottom:80px;right:20px;width:360px;height:520px;background:#fff;border:1px solid #ddd;border-radius:12px;display:none;flex-direction:column;overflow:hidden;z-index:999999;box-shadow:0 12px 40px rgba(0,0,0,.3)";
    panel.innerHTML = `
      <div style="padding:10px;border-bottom:1px solid #eee;font-weight:600">Ghostbot</div>
      <iframe src="https://ghostbot-chat.vercel.app" style="border:0;width:100%;height:100%"></iframe>
    `;
    document.body.appendChild(panel);
  }

  return (
    <button
      onClick={openPanel}
      aria-label="Open chat"
      className="fixed bottom-4 right-4 z-[999999] rounded-2xl border bg-brand-600 px-4 py-3 font-semibold text-white shadow-lg sm:bottom-6 sm:right-6"
    >
      Chat
    </button>
  );
}
