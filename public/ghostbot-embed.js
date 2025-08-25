// ghostbot-embed.js — floating chat widget for client sites
(function () {
  const launcher = document.createElement("div");
  launcher.id = "ghostbot-launcher";
  launcher.innerText = "💬";
  Object.assign(launcher.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "60px",
    height: "60px",
    background: "#1db954",
    color: "#fff",
    fontSize: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: "9999"
  });
  document.body.appendChild(launcher);

  const iframe = document.createElement("iframe");
  iframe.id = "ghostbot-widget";
  iframe.src = "https://ghostai.solutions/demo?configId=ghostai"; // replace if needed per client
  Object.assign(iframe.style, {
    position: "fixed",
    bottom: "90px",
    right: "20px",
    width: "360px",
    height: "540px",
    border: "none",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    display: "none",
    zIndex: "9998"
  });
  document.body.appendChild(iframe);

  launcher.addEventListener("click", () => {
    iframe.style.display = iframe.style.display === "block" ? "none" : "block";
  });
})();
