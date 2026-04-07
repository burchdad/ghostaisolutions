// ghostbot-embed.js
// Embeddable launcher + chat panel for third-party sites.
(function () {
  if (window.__ghostbotEmbedInitialized) return;
  window.__ghostbotEmbedInitialized = true;

  var current = document.currentScript;
  var dataset = (current && current.dataset) || {};

  var agentUrl = (dataset.agentUrl || "https://ghostbot-chat.vercel.app").replace(/\/$/, "");
  var brand = dataset.brand || "Ghostbot";
  var primary = dataset.primary || "#1db954";
  var position = dataset.position === "left" ? "left" : "right";
  var configId = dataset.configId || "ghostai";

  var panelOffset = 90;
  var edgeOffset = 20;
  var root = document.createElement("div");
  root.id = "ghostbot-embed-root";

  var launcher = document.createElement("button");
  launcher.type = "button";
  launcher.id = "ghostbot-launcher";
  launcher.setAttribute("aria-label", "Open chat");
  launcher.innerHTML = "<span aria-hidden=\"true\">Chat</span>";

  var panel = document.createElement("div");
  panel.id = "ghostbot-panel";
  panel.setAttribute("aria-hidden", "true");

  var header = document.createElement("div");
  header.id = "ghostbot-panel-header";
  header.innerHTML = "<strong>" + brand + "</strong>";

  var close = document.createElement("button");
  close.type = "button";
  close.setAttribute("aria-label", "Close chat");
  close.textContent = "x";
  close.id = "ghostbot-close";

  var iframe = document.createElement("iframe");
  iframe.id = "ghostbot-widget";
  iframe.title = brand;
  iframe.allow = "clipboard-write; microphone; camera";
  iframe.loading = "lazy";

  var src = agentUrl;
  if (configId) {
    var joiner = src.indexOf("?") >= 0 ? "&" : "?";
    src += joiner + "configId=" + encodeURIComponent(configId);
  }
  iframe.src = src;

  header.appendChild(close);
  panel.appendChild(header);
  panel.appendChild(iframe);
  root.appendChild(launcher);
  root.appendChild(panel);
  document.body.appendChild(root);

  var style = document.createElement("style");
  style.id = "ghostbot-embed-style";
  style.textContent =
    "#ghostbot-launcher{position:fixed;bottom:" +
    edgeOffset +
    "px;" +
    position +
    ":" +
    edgeOffset +
    "px;z-index:2147483000;height:58px;min-width:58px;padding:0 16px;border:0;border-radius:999px;background:" +
    primary +
    ";color:#07130d;font:600 14px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;cursor:pointer;box-shadow:0 12px 32px rgba(0,0,0,.28)}" +
    "#ghostbot-panel{position:fixed;bottom:" +
    panelOffset +
    "px;" +
    position +
    ":" +
    edgeOffset +
    "px;z-index:2147482999;width:min(380px,calc(100vw - 20px));height:min(620px,calc(100vh - 120px));background:#0f1220;border:1px solid rgba(255,255,255,.12);border-radius:14px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.45);opacity:0;transform:translateY(10px) scale(.98);pointer-events:none;transition:opacity .18s ease,transform .18s ease}" +
    "#ghostbot-panel.open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}" +
    "#ghostbot-panel-header{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:" +
    primary +
    ";color:#07130d;font:600 14px/1.2 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}" +
    "#ghostbot-close{height:28px;min-width:28px;padding:0 8px;border:0;border-radius:999px;background:rgba(0,0,0,.12);color:#07130d;font:700 13px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;cursor:pointer}" +
    "#ghostbot-widget{display:block;width:100%;height:calc(100% - 48px);border:0;background:#111}" +
    "@media (max-width:640px){#ghostbot-launcher{bottom:14px;" +
    position +
    ":14px}#ghostbot-panel{bottom:8px;" +
    position +
    ":8px;width:calc(100vw - 16px);height:calc(100vh - 16px);border-radius:12px}}";
  document.head.appendChild(style);

  function openPanel() {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    launcher.setAttribute("aria-label", "Close chat");
  }

  function closePanel() {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    launcher.setAttribute("aria-label", "Open chat");
  }

  function togglePanel() {
    if (panel.classList.contains("open")) closePanel();
    else openPanel();
  }

  launcher.addEventListener("click", togglePanel);
  close.addEventListener("click", closePanel);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closePanel();
  });
})();
