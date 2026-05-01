import crypto from "crypto";
import fs from "fs";
import path from "path";
import { deleteProviderConnectionsByUserId } from "@/lib/tokenStore";

const STORE_DIR = path.join(process.cwd(), ".internal", "meta-data-deletion");
const REQUESTS_DIR = path.join(STORE_DIR, "requests");

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 20;

const inMemoryRateLimit = new Map();

function ensureStore() {
  fs.mkdirSync(REQUESTS_DIR, { recursive: true });
}

function toBase64(value) {
  return value.replace(/-/g, "+").replace(/_/g, "/");
}

function decodeBase64Url(value) {
  const normalized = toBase64(value);
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  return Buffer.from(padded, "base64");
}

function hash(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function nowIso() {
  return new Date().toISOString();
}

function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://ghostai.solutions").replace(/\/$/, "");
}

function getRequestPath(confirmationCode) {
  return path.join(REQUESTS_DIR, `${confirmationCode}.json`);
}

function generateConfirmationCode() {
  return crypto.randomBytes(12).toString("hex");
}

function scrubSensitiveValues(input, scopedUserId) {
  if (Array.isArray(input)) {
    return input.map((item) => scrubSensitiveValues(item, scopedUserId));
  }

  if (!input || typeof input !== "object") {
    if (typeof input === "string" && input === scopedUserId) {
      return "[deleted]";
    }
    return input;
  }

  const clone = { ...input };
  const keyCandidates = ["facebookUserId", "metaUserId", "appScopedUserId", "user_id"];

  for (const key of keyCandidates) {
    if (clone[key] && String(clone[key]) === String(scopedUserId)) {
      clone[key] = "[deleted]";
    }
  }

  for (const key of Object.keys(clone)) {
    clone[key] = scrubSensitiveValues(clone[key], scopedUserId);
  }

  return clone;
}

function walkJsonFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsonFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }
  return files;
}

export function parseAndVerifySignedRequest(signedRequest) {
  const appSecret = process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET;
  if (!appSecret) {
    throw new Error("Server missing META_APP_SECRET or FACEBOOK_APP_SECRET");
  }

  if (!signedRequest || typeof signedRequest !== "string" || !signedRequest.includes(".")) {
    throw new Error("Missing or malformed signed_request");
  }

  const [encodedSignature, encodedPayload] = signedRequest.split(".", 2);
  const expected = crypto.createHmac("sha256", appSecret).update(encodedPayload).digest();
  const provided = decodeBase64Url(encodedSignature);

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new Error("Invalid signed_request signature");
  }

  const payloadRaw = decodeBase64Url(encodedPayload).toString("utf8");
  const payload = JSON.parse(payloadRaw);

  if (payload.algorithm && String(payload.algorithm).toUpperCase() !== "HMAC-SHA256") {
    throw new Error("Unsupported signed_request algorithm");
  }

  const scopedUserId = String(payload.user_id || payload.profile_id || "").trim();
  if (!scopedUserId) {
    throw new Error("signed_request payload missing user_id");
  }

  return { payload, scopedUserId };
}

export function checkRateLimit(identifier) {
  const now = Date.now();
  const key = hash(identifier || "unknown");
  const current = inMemoryRateLimit.get(key);

  if (!current || now > current.resetAt) {
    const next = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    inMemoryRateLimit.set(key, next);
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt: next.resetAt };
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  inMemoryRateLimit.set(key, current);
  return { allowed: true, remaining: RATE_LIMIT_MAX - current.count, resetAt: current.resetAt };
}

export function processDeletionForScopedUser(scopedUserId) {
  const targets = [
    path.join(process.cwd(), ".internal", "lead-intelligence"),
    path.join(process.cwd(), ".internal", "social-drafts"),
  ];

  let deletedRecords = 0;
  let scrubbedRecords = 0;
  let matchedFiles = 0;

  for (const target of targets) {
    for (const filePath of walkJsonFiles(target)) {
      const raw = fs.readFileSync(filePath, "utf8");
      if (!raw.includes(scopedUserId)) {
        continue;
      }

      matchedFiles += 1;
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        continue;
      }

      const hasDirectUserReference = Boolean(
        parsed &&
          typeof parsed === "object" &&
          (String(parsed.facebookUserId || "") === scopedUserId ||
            String(parsed.metaUserId || "") === scopedUserId ||
            String(parsed.appScopedUserId || "") === scopedUserId ||
            String(parsed.user_id || "") === scopedUserId)
      );

      if (hasDirectUserReference) {
        fs.unlinkSync(filePath);
        deletedRecords += 1;
        continue;
      }

      const scrubbed = scrubSensitiveValues(parsed, scopedUserId);
      fs.writeFileSync(filePath, JSON.stringify(scrubbed, null, 2));
      scrubbedRecords += 1;
    }
  }

  const deletedMetaConnections = deleteProviderConnectionsByUserId("meta", scopedUserId);
  const deletedFacebookConnections = deleteProviderConnectionsByUserId("facebook", scopedUserId);

  return {
    matchedFiles,
    deletedRecords,
    scrubbedRecords,
    deletedMetaConnections,
    deletedFacebookConnections,
  };
}

export function createDeletionRequestLog({ scopedUserId, requestMeta, deletionResult }) {
  ensureStore();

  const confirmationCode = generateConfirmationCode();
  const createdAt = nowIso();
  const record = {
    confirmationCode,
    status: "completed",
    createdAt,
    completedAt: createdAt,
    scopedUserHash: hash(scopedUserId),
    requestMeta,
    deletionSummary: deletionResult,
  };

  fs.writeFileSync(getRequestPath(confirmationCode), JSON.stringify(record, null, 2));
  return record;
}

export function getDeletionRequestStatus(confirmationCode) {
  if (!confirmationCode) return null;
  const recordPath = getRequestPath(confirmationCode);
  if (!fs.existsSync(recordPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(recordPath, "utf8"));
}

export function buildMetaDeletionResponse(confirmationCode) {
  const baseUrl = getBaseUrl();
  return {
    url: `${baseUrl}/api/meta/data-deletion/status/${confirmationCode}`,
    confirmation_code: confirmationCode,
  };
}