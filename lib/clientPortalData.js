const DEFAULT_MISSION_CONTROL_URL = "https://ghostmissioncontrol-production.up.railway.app";

function getMissionControlBaseUrl() {
  return (
    process.env.GHOST_MISSION_CONTROL_URL ||
    process.env.MISSION_CONTROL_URL ||
    DEFAULT_MISSION_CONTROL_URL
  ).replace(/\/+$/, "");
}

export async function getClientPortalData(accessKey) {
  const key = String(accessKey || "").trim();
  if (!key) {
    return null;
  }

  const url = `${getMissionControlBaseUrl()}/mission/client-portal?key=${encodeURIComponent(key)}`;
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
