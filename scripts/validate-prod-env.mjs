#!/usr/bin/env node

const args = process.argv.slice(2);
const targetArg = args.find((a) => a.startsWith("--target="));
const target = (targetArg ? targetArg.split("=")[1] : "all").toLowerCase();
const strict = args.includes("--strict");

const validTargets = new Set(["vercel", "github", "railway", "all"]);
if (!validTargets.has(target)) {
  console.error(`Invalid --target value: ${target}`);
  console.error("Use one of: vercel, github, railway, all");
  process.exit(2);
}

const GROUPS = {
  vercel: {
    required: [
      "ADMIN_DASHBOARD_PASSWORD",
      "ADMIN_DASHBOARD_SESSION_SECRET",
      "CRON_SECRET",
      "NEXT_PUBLIC_BASE_URL",
      "OPENAI_API_KEY",
      "OAUTH_STATE_SECRET",
      "TOKEN_STORE_ENCRYPTION_KEY",
    ],
    recommended: [
      "OPENAI_MODEL",
      "OPENAI_BASE_URL",
      "GHOSTBOT_API_URL",
      "RAILWAY_TRIGGER_SECRET",
      "AUTOMATION_INTERNAL_BASE_URL",
      "RESEND_API_KEY",
      "RESEND_FROM_EMAIL",
      "LINKEDIN_ACCESS_TOKEN",
      "FACEBOOK_PAGE_ACCESS_TOKEN",
      "FACEBOOK_PAGE_ID",
      "X_CONSUMER_KEY",
      "X_CONSUMER_SECRET",
      "X_ACCESS_TOKEN",
      "X_ACCESS_SECRET",
      "META_APP_SECRET",
      "META_WEBHOOK_VERIFY_TOKEN",
      "GITHUB_APP_ID",
      "GITHUB_APP_PRIVATE_KEY",
      "GITHUB_APP_INSTALLATION_ID",
      "GITHUB_REPO_OWNER",
      "GITHUB_REPO_NAME",
      "GITHUB_TARGET_BRANCH",
      "PRODUCT_HUNT_TOKEN",
      "GENERATE_BLOG_IMAGES",
    ],
  },
  github: {
    required: [
      "OPENAI_API_KEY",
      "CRON_SECRET",
      "NEXT_PUBLIC_BASE_URL",
    ],
    recommended: [
      "GENERATE_BLOG_IMAGES",
    ],
  },
  railway: {
    required: [
      "RAILWAY_TRIGGER_SECRET",
      "CRON_SECRET",
    ],
    recommended: [
      "AUTOMATION_INTERNAL_BASE_URL",
      "NEXT_PUBLIC_BASE_URL",
    ],
  },
};

function selectedGroups() {
  if (target === "all") return ["vercel", "github", "railway"];
  return [target];
}

function checkVars(names) {
  const missing = [];
  for (const name of names) {
    const value = process.env[name];
    if (!value || !String(value).trim()) {
      missing.push(name);
    }
  }
  return missing;
}

let totalMissingRequired = 0;
let totalMissingRecommended = 0;

console.log(`Production env preflight (target=${target}, strict=${strict})`);
console.log("");

for (const group of selectedGroups()) {
  const { required, recommended } = GROUPS[group];
  const missingRequired = checkVars(required);
  const missingRecommended = checkVars(recommended);

  totalMissingRequired += missingRequired.length;
  totalMissingRecommended += missingRecommended.length;

  console.log(`[${group.toUpperCase()}]`);
  if (missingRequired.length === 0) {
    console.log("  Required: OK");
  } else {
    console.log(`  Missing required (${missingRequired.length}): ${missingRequired.join(", ")}`);
  }

  if (missingRecommended.length === 0) {
    console.log("  Recommended: OK");
  } else {
    console.log(`  Missing recommended (${missingRecommended.length}): ${missingRecommended.join(", ")}`);
  }
  console.log("");
}

if (totalMissingRequired > 0) {
  console.error(`FAILED: ${totalMissingRequired} required variable(s) missing.`);
  process.exit(1);
}

if (strict && totalMissingRecommended > 0) {
  console.error(`FAILED (strict): ${totalMissingRecommended} recommended variable(s) missing.`);
  process.exit(1);
}

console.log("PASS: Required environment variables are set for selected target(s).");
if (totalMissingRecommended > 0) {
  console.log("PASS with warnings: Some recommended variables are not set.");
}
