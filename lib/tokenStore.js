import fs from "fs";
import path from "path";

// Token storage path (in project root)
const TOKEN_STORE_PATH = path.join(process.cwd(), ".tokens.json");

// Token expiry times (in seconds)
const TOKEN_EXPIRY = {
  linkedin: 5184000, // 60 days
  x: null, // X tokens don't expire unless revoked
  facebook: 5184000, // 60 days (best practice refresh)
};

export function getStoredTokens() {
  try {
    if (fs.existsSync(TOKEN_STORE_PATH)) {
      const data = fs.readFileSync(TOKEN_STORE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading tokens:", err);
  }
  return {};
}

export function saveTokens(platform, tokens) {
  try {
    const all = getStoredTokens();
    all[platform] = {
      ...tokens,
      savedAt: new Date().toISOString(),
    };
    fs.writeFileSync(TOKEN_STORE_PATH, JSON.stringify(all, null, 2));
    return true;
  } catch (err) {
    console.error("Error saving tokens:", err);
    return false;
  }
}

export function getToken(platform) {
  // First check environment variables (priority)
  const envKey = {
    linkedin: "LINKEDIN_ACCESS_TOKEN",
    x: "X_ACCESS_TOKEN",
    facebook: "FACEBOOK_PAGE_ACCESS_TOKEN",
  }[platform];

  if (envKey && process.env[envKey]) {
    return process.env[envKey];
  }

  // Fall back to stored tokens
  const stored = getStoredTokens();
  const token = stored[platform]?.accessToken;

  if (!token) return null;

  // Check if token has expired
  const savedAt = new Date(stored[platform]?.savedAt);
  const expiry = TOKEN_EXPIRY[platform];

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

export function isTokenExpired(platform) {
  const stored = getStoredTokens();
  const token = stored[platform];

  if (!token) return true;

  const expiry = TOKEN_EXPIRY[platform];
  if (!expiry) return false; // No expiry set

  const savedAt = new Date(token.savedAt);
  const now = new Date();
  const ageSeconds = (now - savedAt) / 1000;

  return ageSeconds > expiry;
}

export function deleteToken(platform) {
  try {
    const all = getStoredTokens();
    delete all[platform];
    fs.writeFileSync(TOKEN_STORE_PATH, JSON.stringify(all, null, 2));
    return true;
  } catch (err) {
    console.error("Error deleting token:", err);
    return false;
  }
}

export function getAllTokens() {
  const stored = getStoredTokens();
  const tokens = {};

  // Merge env vars and stored tokens
  tokens.linkedin = process.env.LINKEDIN_ACCESS_TOKEN || stored.linkedin?.accessToken;
  tokens.x = process.env.X_ACCESS_TOKEN || stored.x?.accessToken;
  tokens.facebook = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || stored.facebook?.accessToken;

  return tokens;
}
