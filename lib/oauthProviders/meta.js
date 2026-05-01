import crypto from "crypto";

const META_GRAPH_BASE = "https://graph.facebook.com/v20.0";
const META_DIALOG_BASE = "https://www.facebook.com/v20.0/dialog/oauth";
const DEFAULT_SCOPES = [
  "pages_show_list",
  "pages_manage_metadata",
  "pages_read_engagement",
  "pages_manage_posts",
  "pages_read_user_content",
  "instagram_basic",
  "instagram_manage_insights",
  "business_management",
  "ads_management",
  "ads_read",
  "leads_retrieval",
].join(",");

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function getStateSecret() {
  return (
    process.env.OAUTH_STATE_SECRET ||
    process.env.ADMIN_DASHBOARD_SESSION_SECRET ||
    process.env.ADMIN_DASHBOARD_PASSWORD ||
    ""
  );
}

function signState(payloadB64) {
  const secret = getStateSecret();
  if (!secret) {
    throw new Error("Missing OAUTH_STATE_SECRET or ADMIN_DASHBOARD_SESSION_SECRET");
  }
  return crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

async function metaGet(path, accessToken, searchParams = {}) {
  const url = new URL(`${META_GRAPH_BASE}${path}`);
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || `Meta API error at ${path}`);
  }

  return data;
}

export function buildMetaOAuthState({ orgId = "default", next = "/admin/agents/social/facebook" } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({ orgId, next, iat: now, exp: now + 60 * 10 })
  ).toString("base64url");
  const signature = signState(payload);
  return `${payload}.${signature}`;
}

export function verifyMetaOAuthState(state) {
  if (!state || typeof state !== "string") {
    throw new Error("Missing OAuth state");
  }

  const [payloadB64, providedSig] = state.split(".");
  if (!payloadB64 || !providedSig) {
    throw new Error("Invalid OAuth state");
  }

  const expectedSig = signState(payloadB64);
  const provided = Buffer.from(providedSig);
  const expected = Buffer.from(expectedSig);

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new Error("OAuth state verification failed");
  }

  const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp < now) {
    throw new Error("OAuth state expired");
  }

  return payload;
}

export function buildMetaOAuthUrl({ orgId = "default", next } = {}) {
  const appId = requireEnv("META_APP_ID");
  const redirectUri = requireEnv("META_REDIRECT_URI");
  if (process.env.NODE_ENV === "production" && !redirectUri.startsWith("https://")) {
    throw new Error("META_REDIRECT_URI must use HTTPS in production");
  }
  const state = buildMetaOAuthState({ orgId, next });
  const url = new URL(META_DIALOG_BASE);

  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", DEFAULT_SCOPES);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);

  return url.toString();
}

export async function exchangeMetaCodeForToken(code) {
  const appId = requireEnv("META_APP_ID");
  const appSecret = requireEnv("META_APP_SECRET");
  const redirectUri = requireEnv("META_REDIRECT_URI");

  const tokenUrl = new URL(`${META_GRAPH_BASE}/oauth/access_token`);
  tokenUrl.searchParams.set("client_id", appId);
  tokenUrl.searchParams.set("client_secret", appSecret);
  tokenUrl.searchParams.set("redirect_uri", redirectUri);
  tokenUrl.searchParams.set("code", code);

  const response = await fetch(tokenUrl, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Meta token exchange failed");
  }

  return data;
}

export async function exchangeForLongLivedMetaToken(shortLivedToken) {
  const appId = requireEnv("META_APP_ID");
  const appSecret = requireEnv("META_APP_SECRET");

  const tokenUrl = new URL(`${META_GRAPH_BASE}/oauth/access_token`);
  tokenUrl.searchParams.set("grant_type", "fb_exchange_token");
  tokenUrl.searchParams.set("client_id", appId);
  tokenUrl.searchParams.set("client_secret", appSecret);
  tokenUrl.searchParams.set("fb_exchange_token", shortLivedToken);

  const response = await fetch(tokenUrl, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Meta long-lived token exchange failed");
  }

  return data;
}

export async function fetchMetaUserProfile(accessToken) {
  return metaGet("/me", accessToken, { fields: "id,name" });
}

export async function fetchMetaConnectedAssets(accessToken) {
  const [pagesResponse, adAccountsResponse, businessesResponse] = await Promise.all([
    metaGet("/me/accounts", accessToken, {
      fields: "id,name,access_token,category,instagram_business_account{id,username},connected_instagram_account{id,username}",
    }),
    metaGet("/me/adaccounts", accessToken, { fields: "id,name,account_status,currency,business{id,name}" }),
    metaGet("/me/businesses", accessToken, { fields: "id,name,verification_status" }),
  ]);

  const pages = Array.isArray(pagesResponse?.data)
    ? pagesResponse.data.map((page) => ({
        id: page.id,
        name: page.name,
        category: page.category || "",
        pageAccessToken: page.access_token || "",
        instagramBusinessAccount: page.instagram_business_account || page.connected_instagram_account || null,
      }))
    : [];

  const instagramAccounts = pages
    .map((page) => page.instagramBusinessAccount)
    .filter(Boolean)
    .map((account) => ({ id: account.id, username: account.username || "" }));

  const adAccounts = Array.isArray(adAccountsResponse?.data)
    ? adAccountsResponse.data.map((account) => ({
        id: account.id,
        name: account.name,
        accountStatus: account.account_status,
        currency: account.currency,
        business: account.business || null,
      }))
    : [];

  const businessManagers = Array.isArray(businessesResponse?.data)
    ? businessesResponse.data.map((business) => ({
        id: business.id,
        name: business.name,
        verificationStatus: business.verification_status || "",
      }))
    : [];

  return {
    pages,
    instagramAccounts,
    adAccounts,
    businessManagers,
  };
}

export function computeExpiryDate(expiresInSeconds) {
  if (!expiresInSeconds) return null;
  return new Date(Date.now() + Number(expiresInSeconds) * 1000).toISOString();
}

export async function revokeMetaAccess(accessToken) {
  if (!accessToken) return;
  const response = await fetch(`${META_GRAPH_BASE}/me/permissions?access_token=${encodeURIComponent(accessToken)}`, {
    method: "DELETE",
    cache: "no-store",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error?.message || "Failed to revoke Meta access");
  }
}