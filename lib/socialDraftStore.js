import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getGitHubRepositoryAccess, hasGitHubAppConfig } from "@/lib/githubAppAuth";
import { normalizeVariant } from "@/lib/socialRepurpose";

const GITHUB_API_BASE = "https://api.github.com";
const LOCAL_DRAFT_DIR = path.join(process.cwd(), ".internal", "social-drafts");
const REMOTE_DRAFT_DIR = ".internal/social-drafts";

function getGitHubConfig() {
  return {
    owner: process.env.GITHUB_REPO_OWNER || "burchdad",
    repo: process.env.GITHUB_REPO_NAME || "ghostaisolutions",
    branch: process.env.GITHUB_TARGET_BRANCH || "main",
  };
}

function createDraftId(slug = "draft") {
  return `${Date.now()}-${slug}`.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
}

function createReviewedByLabel() {
  return "admin";
}

function normalizePlatformVariants(platformVariants = {}) {
  return {
    linkedin: normalizeVariant("linkedin", platformVariants.linkedin),
    x: normalizeVariant("x", platformVariants.x),
    facebook: normalizeVariant("facebook", platformVariants.facebook),
  };
}

function buildDraftRecord(input, existing = {}) {
  const now = new Date().toISOString();
  return {
    id: existing.id || input.id || createDraftId(input.slug),
    slug: input.slug || existing.slug || "",
    title: input.title || existing.title || "Untitled draft",
    excerpt: input.excerpt ?? existing.excerpt ?? "",
    sourceType: input.sourceType || existing.sourceType || "manual-review",
    status: input.status || existing.status || "draft",
    createdAt: existing.createdAt || now,
    updatedAt: now,
    approvedAt: input.status === "approved" ? now : existing.approvedAt || null,
    approvedBy: input.status === "approved" ? createReviewedByLabel() : existing.approvedBy || null,
    rejectedAt: input.status === "rejected" ? now : existing.rejectedAt || null,
    rejectedBy: input.status === "rejected" ? createReviewedByLabel() : existing.rejectedBy || null,
    platformVariants: normalizePlatformVariants(input.platformVariants || existing.platformVariants || {}),
    publishResults: input.publishResults || existing.publishResults || null,
    lastPublishedAt: input.lastPublishedAt || existing.lastPublishedAt || null,
  };
}

function ensureLocalDraftDir() {
  fs.mkdirSync(LOCAL_DRAFT_DIR, { recursive: true });
}

function getLocalDraftPath(id) {
  return path.join(LOCAL_DRAFT_DIR, `${id}.json`);
}

function readLocalDraft(id) {
  const filePath = getLocalDraftPath(id);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeLocalDraft(draft) {
  ensureLocalDraftDir();
  fs.writeFileSync(getLocalDraftPath(draft.id), JSON.stringify(draft, null, 2));
  return draft;
}

async function githubRequest(url, token, options = {}) {
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

  if (response.status === 404) {
    return { ok: false, status: 404, data: null };
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || `GitHub request failed (${response.status})`);
  }

  return { ok: true, status: response.status, data };
}

async function listRemoteDraftPaths(cfg, token) {
  const response = await githubRequest(
    `${GITHUB_API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${REMOTE_DRAFT_DIR}?ref=${cfg.branch}`,
    token
  );

  if (!response.ok && response.status === 404) {
    return [];
  }

  return Array.isArray(response.data) ? response.data.filter((item) => item.name.endsWith(".json")) : [];
}

async function readRemoteDraftByPath(cfg, token, draftPath) {
  const response = await githubRequest(
    `${GITHUB_API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${draftPath}?ref=${cfg.branch}`,
    token
  );

  if (!response.ok || !response.data?.content) {
    return null;
  }

  return {
    draft: JSON.parse(Buffer.from(response.data.content, "base64").toString("utf8")),
    sha: response.data.sha,
  };
}

async function writeRemoteDraft(cfg, token, draft, sha = null) {
  const draftPath = `${REMOTE_DRAFT_DIR}/${draft.id}.json`;
  const response = await githubRequest(
    `${GITHUB_API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${draftPath}`,
    token,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `chore: update social draft ${draft.id}`,
        content: Buffer.from(JSON.stringify(draft, null, 2), "utf8").toString("base64"),
        branch: cfg.branch,
        ...(sha ? { sha } : {}),
      }),
    }
  );

  return response.data;
}

async function getRemoteAccess() {
  const cfg = getGitHubConfig();
  const access = await getGitHubRepositoryAccess({ owner: cfg.owner, repo: cfg.repo });
  return { cfg, token: access.token };
}

export async function listSocialDrafts() {
  if (!hasGitHubAppConfig()) {
    if (!fs.existsSync(LOCAL_DRAFT_DIR)) return [];
    return fs.readdirSync(LOCAL_DRAFT_DIR)
      .filter((file) => file.endsWith(".json"))
      .map((file) => JSON.parse(fs.readFileSync(path.join(LOCAL_DRAFT_DIR, file), "utf8")))
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }

  const { cfg, token } = await getRemoteAccess();
  const draftFiles = await listRemoteDraftPaths(cfg, token);
  const drafts = await Promise.all(
    draftFiles.map(async (file) => {
      const data = await readRemoteDraftByPath(cfg, token, file.path);
      return data?.draft || null;
    })
  );

  return drafts
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
}

export async function getSocialDraft(id) {
  if (!id) return null;

  if (!hasGitHubAppConfig()) {
    return readLocalDraft(id);
  }

  const { cfg, token } = await getRemoteAccess();
  const data = await readRemoteDraftByPath(cfg, token, `${REMOTE_DRAFT_DIR}/${id}.json`);
  return data?.draft || null;
}

export async function createSocialDraft(input) {
  const draft = buildDraftRecord(input);

  if (!hasGitHubAppConfig()) {
    return writeLocalDraft(draft);
  }

  const { cfg, token } = await getRemoteAccess();
  await writeRemoteDraft(cfg, token, draft);
  return draft;
}

export async function updateSocialDraft(id, updates) {
  const existing = await getSocialDraft(id);
  if (!existing) {
    throw new Error("Draft not found");
  }

  const draft = buildDraftRecord({ ...existing, ...updates, id }, existing);

  if (!hasGitHubAppConfig()) {
    return writeLocalDraft(draft);
  }

  const { cfg, token } = await getRemoteAccess();
  const remote = await readRemoteDraftByPath(cfg, token, `${REMOTE_DRAFT_DIR}/${id}.json`);
  await writeRemoteDraft(cfg, token, draft, remote?.sha || null);
  return draft;
}

export async function markDraftPublished(id, publishResults) {
  return updateSocialDraft(id, {
    status: "published",
    publishResults,
    lastPublishedAt: new Date().toISOString(),
  });
}