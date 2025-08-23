// Floating Ghostbot Widget Loader with tracking and auto-trigger
window.onload = () => {
  const launcher = document.createElement('div');
  launcher.id = 'ghostbot-launcher';
  launcher.innerText = '💬';
  launcher.onclick = toggleGhostbot;
  document.body.appendChild(launcher);

  const widget = document.createElement('iframe');
  widget.id = 'ghostbot-widget';
  widget.src = '/demo?configId=ghostai';
  document.body.appendChild(widget);

  // Track which page loaded Ghostbot
  const currentPage = window.location.pathname;
  fetch('/api/track-bot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: currentPage, triggeredAt: new Date().toISOString() })
  });

  // Auto-open on scroll or idle
  let idleTimer;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) toggleGhostbot();
  }, { once: true });

  window.addEventListener("mousemove", () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => toggleGhostbot(), 15000); // 15s idle
  });
};

function toggleGhostbot() {
  const iframe = document.getElementById('ghostbot-widget');
  iframe.style.display = iframe.style.display === 'block' ? 'none' : 'block';
}
