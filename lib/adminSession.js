import crypto from "crypto";

export const ADMIN_SESSION_COOKIE = "ghost_admin_session";
const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSessionSecret() {
  return process.env.ADMIN_DASHBOARD_SESSION_SECRET || process.env.ADMIN_DASHBOARD_PASSWORD || "";
}

function signPayload(payloadB64, secret) {
  return crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

export function createAdminSessionToken(ttlSeconds = DEFAULT_SESSION_TTL_SECONDS) {
  const secret = getSessionSecret();
  if (!secret) return "";

  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({ iat: now, exp: now + ttlSeconds })
  ).toString("base64url");
  const sig = signPayload(payload, secret);
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token) {
  const secret = getSessionSecret();
  if (!secret || !token || typeof token !== "string") {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [payloadB64, providedSig] = parts;
  const expectedSig = signPayload(payloadB64, secret);

  const provided = Buffer.from(providedSig);
  const expected = Buffer.from(expectedSig);

  if (provided.length !== expected.length) {
    return false;
  }

  if (!crypto.timingSafeEqual(provided, expected)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);
    return typeof payload.exp === "number" && payload.exp > now;
  } catch {
    return false;
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DEFAULT_SESSION_TTL_SECONDS,
  };
}
