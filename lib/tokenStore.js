import crypto from "crypto";
import fs from "fs";
import path from "path";

// Token storage path (in project root)
const TOKEN_STORE_PATH = path.join(process.cwd(), ".tokens.json");
const DEFAULT_ORG_ID = "default";

// Token expiry times (in seconds)
const TOKEN_EXPIRY = {
  linkedin: 5184000, // 60 days
  x: null, // X tokens don't expire unless revoked
  facebook: 5184000, // 60 days (best practice refresh)
  meta: 5184000,
};

function getEncryptionSecret() {
  return (
    process.env.TOKEN_STORE_ENCRYPTION_KEY ||
    process.env.ADMIN_DASHBOARD_SESSION_SECRET ||
    process.env.ADMIN_DASHBOARD_PASSWORD ||
    ""
  );
}

function getCipherKey() {
  const secret = getEncryptionSecret();
  if (!secret) return null;
  return crypto.createHash("sha256").update(secret).digest();
}

function encryptJson(data) {
  const key = getCipherKey();
  if (!key) {
    return { encrypted: false, data };
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(data), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: true,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    value: encrypted.toString("base64"),
  };
}

function decryptJson(record) {
  if (!record?.encrypted) {
    return record?.data ?? record;
  }

  const key = getCipherKey();
  if (!key) {
    throw new Error("Missing token store encryption secret");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(record.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(record.tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(record.value, "base64")),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString("utf8"));
}

function getProviderBucket(store, platform) {
  if (!store[platform] || typeof store[platform] !== "object") {
    store[platform] = {};
  }
  return store[platform];
}

function normalizeOrgId(orgId) {
  return String(orgId || DEFAULT_ORG_ID).trim() || DEFAULT_ORG_ID;
}

function buildStoredRecord(tokens = {}) {
  const nowIso = new Date().toISOString();
  return {
    ...tokens,
    savedAt: nowIso,
    updatedAt: nowIso,
    orgId: normalizeOrgId(tokens.orgId),
  };
}

function readRawStore() {
  try {
    if (fs.existsSync(TOKEN_STORE_PATH)) {
      return JSON.parse(fs.readFileSync(TOKEN_STORE_PATH, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading tokens:", err);
  }
  return {};
}

function writeRawStore(store) {
  fs.writeFileSync(TOKEN_STORE_PATH, JSON.stringify(store, null, 2));
}

function decodeLegacyOrScopedRecord(record) {
  if (!record) return null;
  try {
    return decryptJson(record);
  } catch (err) {
    console.error("Error decrypting token record:", err);
    return null;
  }
}

export function getStoredTokens() {
  try {
    const raw = readRawStore();
    const normalized = {};

    for (const [platform, value] of Object.entries(raw)) {
      if (value?.encrypted || value?.iv || value?.data) {
        normalized[platform] = {
          [DEFAULT_ORG_ID]: decodeLegacyOrScopedRecord(value),
        };
        continue;
      }

      if (value && typeof value === "object") {
        const orgEntries = Object.entries(value);
        const scoped = {};
        let looksScoped = true;

        for (const [orgId, orgValue] of orgEntries) {
          if (!(orgValue && typeof orgValue === "object" && (orgValue.encrypted || orgValue.data || orgValue.accessToken || orgValue.savedAt || orgValue.assets))) {
            looksScoped = false;
            break;
          }
          scoped[orgId] = orgValue?.encrypted || orgValue?.data ? decodeLegacyOrScopedRecord(orgValue) : orgValue;
        }

        normalized[platform] = looksScoped ? scoped : { [DEFAULT_ORG_ID]: value };
      }
    }

    return normalized;
  } catch (err) {
    console.error("Error reading tokens:", err);
  }
  return {};
}

export function saveTokens(platform, tokens, options = {}) {
  try {
    const orgId = normalizeOrgId(options.orgId || tokens.orgId);
    const raw = readRawStore();
    const providerBucket = getProviderBucket(raw, platform);
    providerBucket[orgId] = encryptJson(buildStoredRecord({ ...tokens, orgId }));
    writeRawStore(raw);
    return true;
  } catch (err) {
    console.error("Error saving tokens:", err);
    return false;
  }
}

export function getProviderConnection(platform, options = {}) {
  const orgId = normalizeOrgId(options.orgId);
  const stored = getStoredTokens();
  return stored[platform]?.[orgId] || null;
}

export function listProviderConnections(platform) {
  const stored = getStoredTokens();
  return Object.values(stored[platform] || {}).filter(Boolean);
}

export function getToken(platform, options = {}) {
  // First check environment variables (priority)
  const envKey = {
    linkedin: "LINKEDIN_ACCESS_TOKEN",
    x: "X_ACCESS_TOKEN",
    facebook: "FACEBOOK_PAGE_ACCESS_TOKEN",
    meta: "FACEBOOK_PAGE_ACCESS_TOKEN",
  }[platform];

  if (envKey && process.env[envKey]) {
    return process.env[envKey];
  }

  // Fall back to stored tokens
  const connection = getProviderConnection(platform, options);
  const token = connection?.accessToken;

  if (!token) return null;

  // Check if token has expired
  const savedAt = new Date(connection?.savedAt);
  const expiry = TOKEN_EXPIRY[platform];

  if (connection?.expiresAt && new Date(connection.expiresAt) <= new Date()) {
    return null;
  }

  if (expiry) {
    const now = new Date();
    const ageSeconds = (now - savedAt) / 1000;
    if (ageSeconds > expiry) {
      console.log(`Token for ${platform} has expired`);
      return null;
    }
  }

  return token;
}

export function isTokenExpired(platform, options = {}) {
  const token = getProviderConnection(platform, options);

  if (!token) return true;

  const expiry = TOKEN_EXPIRY[platform];
  if (!expiry) return false; // No expiry set

  const savedAt = new Date(token.savedAt);
  const now = new Date();
  const ageSeconds = (now - savedAt) / 1000;

  return ageSeconds > expiry;
}

export function deleteToken(platform, options = {}) {
  try {
    const orgId = normalizeOrgId(options.orgId);
    const raw = readRawStore();
    if (raw[platform] && typeof raw[platform] === "object") {
      delete raw[platform][orgId];
      if (!Object.keys(raw[platform]).length) {
        delete raw[platform];
      }
    } else {
      delete raw[platform];
    }
    writeRawStore(raw);
    return true;
  } catch (err) {
    console.error("Error deleting token:", err);
    return false;
  }
}

export function updateProviderConnection(platform, updates, options = {}) {
  const orgId = normalizeOrgId(options.orgId || updates.orgId);
  const existing = getProviderConnection(platform, { orgId }) || {};
  return saveTokens(platform, { ...existing, ...updates, orgId }, { orgId });
}

export function findProviderConnectionsByUserId(platform, scopedUserId) {
  const stored = getStoredTokens();
  return Object.entries(stored[platform] || {})
    .filter(([, value]) => {
      if (!value) return false;
      return [value.providerUserId, value.metaUserId, value.appScopedUserId].some(
        (candidate) => String(candidate || "") === String(scopedUserId)
      );
    })
    .map(([orgId, value]) => ({ orgId, ...value }));
}

export function deleteProviderConnectionsByUserId(platform, scopedUserId) {
  const matches = findProviderConnectionsByUserId(platform, scopedUserId);
  for (const match of matches) {
    deleteToken(platform, { orgId: match.orgId });
  }
  return matches.length;
}

export function getAllTokens() {
  const stored = getStoredTokens();
  const tokens = {};

  // Merge env vars and stored tokens
  tokens.linkedin = process.env.LINKEDIN_ACCESS_TOKEN || stored.linkedin?.[DEFAULT_ORG_ID]?.accessToken;
  tokens.x = process.env.X_ACCESS_TOKEN || stored.x?.[DEFAULT_ORG_ID]?.accessToken;
  tokens.facebook = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || stored.facebook?.[DEFAULT_ORG_ID]?.accessToken;
  tokens.meta = tokens.facebook;

  return tokens;
}
