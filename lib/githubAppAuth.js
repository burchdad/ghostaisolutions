import crypto from "crypto";

const GITHUB_API_BASE = "https://api.github.com";

function base64UrlEncode(input) {
  return Buffer.from(input).toString("base64url");
}

function normalizePrivateKey(rawKey = "") {
  const value = String(rawKey || "").trim().replace(/^"|"$/g, "");
  if (!value) return "";

  // Typical Vercel input when user pastes with escaped newlines.
  if (value.includes("BEGIN") || value.includes("\\n")) {
    return value.replace(/\\n/g, "\n").trim();
  }

  // Allow base64-encoded PEM as a safer transport format.
  try {
    const decoded = Buffer.from(value, "base64").toString("utf8").trim();
    if (decoded.includes("BEGIN") && decoded.includes("PRIVATE KEY")) {
      return decoded;
    }
  } catch {
    // Fall through to raw value.
  }

  return value;
}

export function getGitHubAppConfig() {
  return {
    appId: String(process.env.GITHUB_APP_ID || "").trim(),
    installationId: String(process.env.GITHUB_APP_INSTALLATION_ID || "").trim(),
    privateKey: normalizePrivateKey(process.env.GITHUB_APP_PRIVATE_KEY || ""),
  };
}

export function hasGitHubAppConfig() {
  const config = getGitHubAppConfig();
  return Boolean(config.appId && config.privateKey);
}

export function hasGitHubTokenConfig() {
  return Boolean(
    process.env.GITHUB_TOKEN ||
    process.env.GH_TOKEN ||
    process.env.GITHUB_PERSONAL_TOKEN
  );
}

export function hasGitHubWriteConfig() {
  return hasGitHubAppConfig() || hasGitHubTokenConfig();
}

export function createGitHubAppJwt({ appId, privateKey }) {
  if (!appId || !privateKey) {
    throw new Error("Missing GitHub App credentials");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iat: now - 60,
      exp: now + 9 * 60,
      iss: appId,
    })
  );

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  signer.end();

  let signature;
  try {
    signature = signer.sign(privateKey, "base64url");
  } catch (error) {
    throw new Error(
      `Failed to sign GitHub App JWT. Ensure GITHUB_APP_PRIVATE_KEY is a valid private key PEM (or base64-encoded PEM). Root error: ${error?.message || String(error)}`
    );
  }

  return `${header}.${payload}.${signature}`;
}

async function fetchGitHubJson(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${data?.message || `GitHub API request failed (${response.status})`} [${options.method || "GET"} ${url}]`);
  }

  return data;
}

async function resolveInstallationId({ owner, repo, jwt, installationId }) {
  if (installationId) {
    return installationId;
  }

  const data = await fetchGitHubJson(`${GITHUB_API_BASE}/repos/${owner}/${repo}/installation`, jwt);
  return String(data?.id || "").trim();
}

async function createInstallationAccessToken({ owner, repo, appId, privateKey, installationId }) {
  const jwt = createGitHubAppJwt({ appId, privateKey });
  const resolvedInstallationId = await resolveInstallationId({ owner, repo, jwt, installationId });

  if (!resolvedInstallationId) {
    throw new Error("Unable to resolve GitHub App installation ID");
  }

  const data = await fetchGitHubJson(
    `${GITHUB_API_BASE}/app/installations/${resolvedInstallationId}/access_tokens`,
    jwt,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repositories: [repo],
        permissions: {
          contents: "write",
          metadata: "read",
        },
      }),
    }
  );

  if (!data?.token) {
    throw new Error("GitHub App installation token was not returned");
  }

  return {
    token: data.token,
    mode: "github-app",
    installationId: resolvedInstallationId,
    expiresAt: data.expires_at || null,
  };
}

export async function getGitHubRepositoryAccess({ owner, repo }) {
  const appConfig = getGitHubAppConfig();
  const token =
    process.env.GITHUB_TOKEN ||
    process.env.GH_TOKEN ||
    process.env.GITHUB_PERSONAL_TOKEN ||
    "";

  if (appConfig.appId && appConfig.privateKey) {
    try {
      return await createInstallationAccessToken({ owner, repo, ...appConfig });
    } catch (error) {
      if (!token) {
        throw new Error(
          `GitHub App auth failed for ${owner}/${repo}: ${error?.message || String(error)}. Check GITHUB_APP_INSTALLATION_ID and repository access, or set GITHUB_TOKEN/GH_TOKEN/GITHUB_PERSONAL_TOKEN as a fallback.`
        );
      }
    }
  }

  if (token) {
    return {
      token,
      mode: "token",
      installationId: null,
      expiresAt: null,
    };
  }

  throw new Error(
    "Missing GitHub write auth. Set GITHUB_APP_ID + GITHUB_APP_PRIVATE_KEY (+ optional GITHUB_APP_INSTALLATION_ID), or provide GITHUB_TOKEN/GH_TOKEN/GITHUB_PERSONAL_TOKEN."
  );
}
