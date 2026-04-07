const GHOST_PULSE_EVENT = "ghost-avatar:pulse";
const GHOST_VOICE_EVENT = "ghost-avatar:voice";
const GHOST_PANEL_EVENT = "ghost-avatar:panel";
const GHOST_STATE_EVENT = "ghost-avatar:state";

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

export function emitGhostState(detail = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    mode: detail.mode || "default",
    thinking: Boolean(detail.thinking),
    chunkTick: Number(detail.chunkTick) || 0,
    pageContext: detail.pageContext || "",
    intents: Array.isArray(detail.intents) ? detail.intents : [],
    memory: detail.memory && typeof detail.memory === "object" ? detail.memory : {},
    source: detail.source || "ghost-state",
    gesture: detail.gesture || "",
  };

  window.dispatchEvent(new CustomEvent(GHOST_STATE_EVENT, { detail: payload }));
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

export function onGhostState(handler) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = (event) => handler(event.detail || {});
  window.addEventListener(GHOST_STATE_EVENT, listener);
  return () => window.removeEventListener(GHOST_STATE_EVENT, listener);
}