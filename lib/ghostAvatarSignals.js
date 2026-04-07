const GHOST_PULSE_EVENT = "ghost-avatar:pulse";
const GHOST_VOICE_EVENT = "ghost-avatar:voice";
const GHOST_PANEL_EVENT = "ghost-avatar:panel";

export function emitGhostPulseBurst(detail = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(GHOST_PULSE_EVENT, { detail }));
}

export function emitGhostVoiceState(detail = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    active: Boolean(detail.active),
    level: Math.max(0, Math.min(1, Number(detail.level) || 0)),
    source: detail.source || "ghost-voice",
  };

  window.dispatchEvent(new CustomEvent(GHOST_VOICE_EVENT, { detail: payload }));
}

export function emitGhostPanelToggle(detail = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(GHOST_PANEL_EVENT, { detail }));
}

export function onGhostPulseBurst(handler) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = (event) => handler(event.detail || {});
  window.addEventListener(GHOST_PULSE_EVENT, listener);
  return () => window.removeEventListener(GHOST_PULSE_EVENT, listener);
}

export function onGhostVoiceState(handler) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = (event) => handler(event.detail || {});
  window.addEventListener(GHOST_VOICE_EVENT, listener);
  return () => window.removeEventListener(GHOST_VOICE_EVENT, listener);
}

export function onGhostPanelToggle(handler) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = (event) => handler(event.detail || {});
  window.addEventListener(GHOST_PANEL_EVENT, listener);
  return () => window.removeEventListener(GHOST_PANEL_EVENT, listener);
}