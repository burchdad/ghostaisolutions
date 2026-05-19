import crypto from "crypto";

function clean(value = "") {
  return String(value || "").trim();
}

function getConfiguredTokens() {
  return [
    process.env.LEAD_INTELLIGENCE_API_KEY,
    process.env.GHOST_LEAD_INTELLIGENCE_API_KEY,
  ].map(clean).filter(Boolean);
}

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function getLeadIntelligenceServiceStatus() {
  return {
    authConfigured: getConfiguredTokens().length > 0,
    hasOpenAI: Boolean(clean(process.env.OPENAI_API_KEY)),
    hasResend: Boolean(clean(process.env.RESEND_API_KEY)),
    storageMode: process.env.GITHUB_APP_ID && process.env.GITHUB_APP_INSTALLATION_ID ? "github" : "local",
  };
}

export function requireLeadIntelligenceServiceAuth(request) {
  const tokens = getConfiguredTokens();
  if (!tokens.length) {
    return {
      ok: false,
      status: 503,
      error: "Lead Intelligence service token is not configured",
      details: "Set LEAD_INTELLIGENCE_API_KEY in the service environment.",
    };
  }

  const authHeader = clean(request.headers.get("authorization"));
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token || !tokens.some((candidate) => safeEqual(token, candidate))) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  return { ok: true };
}

