const DEFAULT_MISSION_CONTROL_URL = "https://ghostmissioncontrol-production.up.railway.app";

function getMissionControlBaseUrl() {
  return (
    process.env.GHOST_MISSION_CONTROL_URL ||
    process.env.MISSION_CONTROL_URL ||
    DEFAULT_MISSION_CONTROL_URL
  ).replace(/\/+$/, "");
}

export const CLIENT_PORTAL_SESSION_COOKIE = "ghost_client_portal_session";

export function clientPortalCookieOptions(maxAge = 60 * 60 * 24 * 30) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export async function getClientPortalData(accessKey, sessionToken = "") {
  const key = String(accessKey || "").trim();
  const session = String(sessionToken || "").trim();
  if (!key && !session) {
    return null;
  }

  const params = new URLSearchParams();
  if (key) params.set("key", key);
  if (session) params.set("session", session);
  const url = `${getMissionControlBaseUrl()}/mission/client-portal?${params.toString()}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { ok: false, error: text || "Unable to parse client portal response." };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: payload?.error || "Unable to load client portal data.",
    };
  }

  return payload;
}

async function postClientPortalAction(path, body = {}) {
  const url = `${getMissionControlBaseUrl()}${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { ok: false, error: text || "Unable to parse client portal response." };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: payload?.error || "Client portal request failed.",
    };
  }

  return payload;
}

export function createClientPortalAccount(body) {
  return postClientPortalAction("/mission/client-portal/create-account", body);
}

export function signInClientPortalAccount(body) {
  return postClientPortalAction("/mission/client-portal/sign-in", body);
}

export function logoutClientPortalAccount(body) {
  return postClientPortalAction("/mission/client-portal/logout", body);
}

export function requestClientPortalPasswordReset(body) {
  return postClientPortalAction("/mission/client-portal/password-reset/request", body);
}

export function confirmClientPortalPasswordReset(body) {
  return postClientPortalAction("/mission/client-portal/password-reset/confirm", body);
}

export function requestClientPortalMagicLink(body) {
  return postClientPortalAction("/mission/client-portal/magic-link/request", body);
}

export function consumeClientPortalMagicLink(body) {
  return postClientPortalAction("/mission/client-portal/magic-link/consume", body);
}

export function verifyClientPortalEmail(body) {
  return postClientPortalAction("/mission/client-portal/verify-email", body);
}

export function changeClientPortalPassword(body) {
  return postClientPortalAction("/mission/client-portal/change-password", body);
}
