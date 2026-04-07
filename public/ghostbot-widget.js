// Legacy compatibility loader.
// Existing installs that reference /ghostbot-widget.js are redirected to /ghostbot-embed.js.
(function () {
  if (window.__ghostbotWidgetShimLoaded) return;
  window.__ghostbotWidgetShimLoaded = true;

  var script = document.currentScript;
  var origin = window.location.origin;

  try {
    if (script && script.src) {
      origin = new URL(script.src).origin;
    }
  } catch (_e) {
    origin = window.location.origin;
  }

  var next = document.createElement("script");
  next.src = origin + "/ghostbot-embed.js";
  next.defer = true;

  // Pass supported data-* settings through to the canonical loader.
  if (script && script.dataset) {
    var data = script.dataset;
    if (data.agentUrl) next.dataset.agentUrl = data.agentUrl;
    if (data.brand) next.dataset.brand = data.brand;
    if (data.primary) next.dataset.primary = data.primary;
    if (data.position) next.dataset.position = data.position;
    if (data.configId) next.dataset.configId = data.configId;
  }

  document.head.appendChild(next);
})();
