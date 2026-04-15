import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getGitHubRepositoryAccess, hasGitHubAppConfig } from "@/lib/githubAppAuth";

const GITHUB_API_BASE = "https://api.github.com";
const LOCAL_LEAD_DIR = path.join(process.cwd(), ".internal", "lead-intelligence");
const REMOTE_LEAD_DIR = ".internal/lead-intelligence";

function getGitHubConfig() {
  return {
    owner: process.env.GITHUB_REPO_OWNER || "burchdad",
    repo: process.env.GITHUB_REPO_NAME || "ghostaisolutions",
    branch: process.env.GITHUB_TARGET_BRANCH || "main",
  };
}

function createLeadId(seed = "lead") {
  const timestamp = Date.now().toString(36);
  const hash = crypto.createHash("sha1").update(`${seed}-${Date.now()}`).digest("hex").slice(0, 8);
  return `lead-${timestamp}-${hash}`;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeStatus(status) {
  const allowed = new Set([
    "new",
    "qualified",
    "ready_outreach",
    "contacted",
    "replied",
    "won",
    "unqualified",
  ]);
  return allowed.has(status) ? status : "new";
}

function normalizeLead(input, existing = {}) {
  const createdAt = existing.createdAt || nowIso();
  const updatedAt = nowIso();

  return {
    id: existing.id || input.id || createLeadId(input.domain || input.companyName || "lead"),
    createdAt,
    updatedAt,
    companyName: input.companyName || existing.companyName || "Unknown company",
    domain: input.domain || existing.domain || "",
    website: input.website || existing.website || "",
    sourceType: input.sourceType || existing.sourceType || "scraped",
    sourceUrl: input.sourceUrl || existing.sourceUrl || "",
    ownerName: input.ownerName ?? existing.ownerName ?? "",
    ownerRole: input.ownerRole ?? existing.ownerRole ?? "",
    ownerEmail: input.ownerEmail ?? existing.ownerEmail ?? "",
    contactEmail: input.contactEmail ?? existing.contactEmail ?? "",
    linkedinUrl: input.linkedinUrl ?? existing.linkedinUrl ?? "",
    summary: input.summary ?? existing.summary ?? "",
    aiOpportunity: {
      score: Math.max(0, Math.min(100, Number(input.aiOpportunity?.score ?? existing.aiOpportunity?.score ?? 0))),
      reasons: Array.isArray(input.aiOpportunity?.reasons)
        ? input.aiOpportunity.reasons.slice(0, 8)
        : Array.isArray(existing.aiOpportunity?.reasons)
          ? existing.aiOpportunity.reasons.slice(0, 8)
          : [],
    },
    signals: {
      hasBlog: Boolean(input.signals?.hasBlog ?? existing.signals?.hasBlog ?? false),
      hasNewsletter: Boolean(input.signals?.hasNewsletter ?? existing.signals?.hasNewsletter ?? false),
      hasScheduling: Boolean(input.signals?.hasScheduling ?? existing.signals?.hasScheduling ?? false),
      hasChatWidget: Boolean(input.signals?.hasChatWidget ?? existing.signals?.hasChatWidget ?? false),
      mentionsAI: Boolean(input.signals?.mentionsAI ?? existing.signals?.mentionsAI ?? false),
      services: Array.isArray(input.signals?.services)
        ? input.signals.services.slice(0, 20)
        : Array.isArray(existing.signals?.services)
          ? existing.signals.services.slice(0, 20)
          : [],
      techHints: Array.isArray(input.signals?.techHints)
        ? input.signals.techHints.slice(0, 20)
        : Array.isArray(existing.signals?.techHints)
          ? existing.signals.techHints.slice(0, 20)
          : [],
    },
    status: normalizeStatus(input.status || existing.status || "new"),
    score: {
      fit: Math.max(0, Math.min(100, Number(input.score?.fit ?? existing.score?.fit ?? 0))),
      urgency: Math.max(0, Math.min(100, Number(input.score?.urgency ?? existing.score?.urgency ?? 0))),
      total: Math.max(0, Math.min(100, Number(input.score?.total ?? existing.score?.total ?? 0))),
      reasons: Array.isArray(input.score?.reasons)
        ? input.score.reasons.slice(0, 10)
        : Array.isArray(existing.score?.reasons)
          ? existing.score.reasons.slice(0, 10)
          : [],
    },
    notes: input.notes ?? existing.notes ?? "",
    emailDraft: input.emailDraft || existing.emailDraft || null,
    emailEvents: Array.isArray(input.emailEvents)
      ? input.emailEvents
      : Array.isArray(existing.emailEvents)
        ? existing.emailEvents
        : [],
    lastContactedAt: input.lastContactedAt || existing.lastContactedAt || null,
  };
}

function ensureLocalLeadDir() {
  fs.mkdirSync(LOCAL_LEAD_DIR, { recursive: true });
}

function getLocalLeadPath(id) {
  return path.join(LOCAL_LEAD_DIR, `${id}.json`);
}

function readLocalLead(id) {
  const leadPath = getLocalLeadPath(id);
  if (!fs.existsSync(leadPath)) return null;
  return JSON.parse(fs.readFileSync(leadPath, "utf8"));
}

function writeLocalLead(lead) {
  ensureLocalLeadDir();
  fs.writeFileSync(getLocalLeadPath(lead.id), JSON.stringify(lead, null, 2));
  return lead;
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

async function listRemoteLeadPaths(cfg, token) {
  const response = await githubRequest(
    `${GITHUB_API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${REMOTE_LEAD_DIR}?ref=${cfg.branch}`,
    token
  );

  if (!response.ok && response.status === 404) {
    return [];
  }

  return Array.isArray(response.data) ? response.data.filter((item) => item.name.endsWith(".json")) : [];
}

async function readRemoteLeadByPath(cfg, token, leadPath) {
  const response = await githubRequest(
    `${GITHUB_API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${leadPath}?ref=${cfg.branch}`,
    token
  );

  if (!response.ok || !response.data?.content) {
    return null;
  }

  return {
    lead: JSON.parse(Buffer.from(response.data.content, "base64").toString("utf8")),
    sha: response.data.sha,
  };
}

async function writeRemoteLead(cfg, token, lead, sha = null) {
  const leadPath = `${REMOTE_LEAD_DIR}/${lead.id}.json`;
  const response = await githubRequest(
    `${GITHUB_API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${leadPath}`,
    token,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `chore: update lead ${lead.id}`,
        content: Buffer.from(JSON.stringify(lead, null, 2), "utf8").toString("base64"),
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

export async function listLeads() {
  if (!hasGitHubAppConfig()) {
    if (!fs.existsSync(LOCAL_LEAD_DIR)) return [];
    return fs.readdirSync(LOCAL_LEAD_DIR)
      .filter((file) => file.endsWith(".json"))
      .map((file) => JSON.parse(fs.readFileSync(path.join(LOCAL_LEAD_DIR, file), "utf8")))
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }

  const { cfg, token } = await getRemoteAccess();
  const leadFiles = await listRemoteLeadPaths(cfg, token);
  const leads = await Promise.all(
    leadFiles.map(async (file) => {
      const data = await readRemoteLeadByPath(cfg, token, file.path);
      return data?.lead || null;
    })
  );

  return leads
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
}

export async function getLead(id) {
  if (!id) return null;

  if (!hasGitHubAppConfig()) {
    return readLocalLead(id);
  }

  const { cfg, token } = await getRemoteAccess();
  const data = await readRemoteLeadByPath(cfg, token, `${REMOTE_LEAD_DIR}/${id}.json`);
  return data?.lead || null;
}

export async function createLead(input) {
  const lead = normalizeLead(input);

  if (!hasGitHubAppConfig()) {
    return writeLocalLead(lead);
  }

  const { cfg, token } = await getRemoteAccess();
  await writeRemoteLead(cfg, token, lead);
  return lead;
}

export async function updateLead(id, updates) {
  const existing = await getLead(id);
  if (!existing) {
    throw new Error("Lead not found");
  }

  const lead = normalizeLead({ ...existing, ...updates, id }, existing);

  if (!hasGitHubAppConfig()) {
    return writeLocalLead(lead);
  }

  const { cfg, token } = await getRemoteAccess();
  const remote = await readRemoteLeadByPath(cfg, token, `${REMOTE_LEAD_DIR}/${id}.json`);
  await writeRemoteLead(cfg, token, lead, remote?.sha || null);
  return lead;
}

export async function upsertLeadByDomain(input) {
  const normalizedDomain = String(input.domain || "").toLowerCase().trim();
  if (!normalizedDomain) {
    return createLead(input);
  }

  const leads = await listLeads();
  const existing = leads.find((lead) => String(lead.domain || "").toLowerCase().trim() === normalizedDomain);

  if (!existing) {
    return createLead(input);
  }

  return updateLead(existing.id, { ...existing, ...input });
}
