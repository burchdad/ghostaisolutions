import { NextResponse } from "next/server";
import { getGitHubRepositoryAccess } from "@/lib/githubAppAuth";

const GITHUB_API_BASE = "https://api.github.com";
const TEST_FILE_PATH = ".internal/content-agent-write-test.json";

function getCronSecret() {
  return process.env.CRON_SECRET || process.env.SOCIAL_AGENT_CRON_SECRET || "";
}

function getGitHubConfig() {
  return {
    owner: process.env.GITHUB_REPO_OWNER || "burchdad",
    repo: process.env.GITHUB_REPO_NAME || "ghostaisolutions",
    branch: process.env.GITHUB_TARGET_BRANCH || "main",
  };
}

async function getExistingFileSha(cfg, authToken) {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${TEST_FILE_PATH}?ref=${cfg.branch}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${authToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`GitHub read test file failed (${response.status}): ${message}`);
  }

  const data = await response.json();
  return data?.sha || null;
}

async function writeTestFile(cfg, authToken, sha = null) {
  const payload = {
    checkedAt: new Date().toISOString(),
    source: "content-agent-repo-write-test",
    repository: `${cfg.owner}/${cfg.repo}`,
    branch: cfg.branch,
  };

  const response = await fetch(`${GITHUB_API_BASE}/repos/${cfg.owner}/${cfg.repo}/contents/${TEST_FILE_PATH}`, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message: `chore: update content agent write test ${new Date().toISOString().slice(0, 10)}`,
      content: Buffer.from(JSON.stringify(payload, null, 2), "utf8").toString("base64"),
      branch: cfg.branch,
      ...(sha ? { sha } : {}),
    }),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || `GitHub write test failed (${response.status})`);
  }

  return {
    commitSha: data?.commit?.sha || null,
    contentSha: data?.content?.sha || null,
    path: data?.content?.path || TEST_FILE_PATH,
    htmlUrl: data?.content?.html_url || null,
  };
}

async function run(request) {
  const authHeader = request.headers.get("Authorization");
  const cronSecret = getCronSecret();

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing cron secret" },
      { status: 401 }
    );
  }

  try {
    const cfg = getGitHubConfig();
    const githubAccess = await getGitHubRepositoryAccess({ owner: cfg.owner, repo: cfg.repo });
    const existingSha = await getExistingFileSha(cfg, githubAccess.token);
    const writeResult = await writeTestFile(cfg, githubAccess.token, existingSha);

    return NextResponse.json({
      success: true,
      repository: `${cfg.owner}/${cfg.repo}`,
      branch: cfg.branch,
      auth: {
        mode: githubAccess.mode,
        installationId: githubAccess.installationId,
        expiresAt: githubAccess.expiresAt,
      },
      file: writeResult,
      updatedExistingFile: Boolean(existingSha),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Repo write test failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return run(request);
}

export async function POST(request) {
  return run(request);
}