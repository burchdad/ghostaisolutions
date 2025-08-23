// Floating Ghostbot Widget Loader
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
};

function toggleGhostbot() {
  const iframe = document.getElementById('ghostbot-widget');
  iframe.style.display = iframe.style.display === 'block' ? 'none' : 'block';
}
