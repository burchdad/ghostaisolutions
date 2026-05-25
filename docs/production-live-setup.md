# Production Live Setup (Vercel Cron + GitHub Actions + Railway)

This guide is the canonical production checklist for this repository.

## 1) Vercel environment variables

Set these in Vercel Project Settings -> Environment Variables for Production.

Required:
- `ADMIN_DASHBOARD_PASSWORD`
- `ADMIN_DASHBOARD_SESSION_SECRET`
- `CRON_SECRET`
- `NEXT_PUBLIC_BASE_URL`
- `OPENAI_API_KEY`
- `OAUTH_STATE_SECRET`
- `TOKEN_STORE_ENCRYPTION_KEY`

Recommended for full agent stack:
- `OPENAI_MODEL` (default `gpt-4o-mini`)
- `OPENAI_BASE_URL` (default `https://api.openai.com/v1`)
- `DATABASE_URL` (Railway Postgres; used first for competitor intelligence, social draft, lead intelligence, and cron run storage when configured)
- `RAILWAY_TRIGGER_SECRET`
- `AUTOMATION_INTERNAL_BASE_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `LINKEDIN_ACCESS_TOKEN`
- `FACEBOOK_PAGE_ACCESS_TOKEN`
- `FACEBOOK_PAGE_ID`
- `X_CONSUMER_KEY`
- `X_CONSUMER_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_SECRET`
- `META_APP_SECRET`
- `META_WEBHOOK_VERIFY_TOKEN`
- `SLACK_ALERTS_WEBHOOK`
- `SLACK_OPS_SUMMARY_WEBHOOK`
- `SLACK_SOCIAL_APPROVAL_WEBHOOK` (optional; falls back to `SLACK_ALERTS_WEBHOOK`)
- `SLACK_APPROVAL_SECRET` (optional; falls back to `CRON_SECRET`)
- `SLACK_BOT_TOKEN`
- `SLACK_SIGNING_SECRET`
- `SLACK_APP_LEVEL_TOKEN`
- `SLACK_ACTION_TOKEN`
- `SLACK_COMMAND_TOKEN`
- `SOCIAL_APPROVAL_DAILY_LIMIT` (default `1`, maximum `3`)
- `SOCIAL_ENGAGEMENT_DRAFT_LIMIT` (default `10`, maximum `20`)
- `SOCIAL_ENGAGEMENT_PER_POST_LIMIT` (default `10`, maximum `50`)
- `GITHUB_APP_ID`
- `GITHUB_APP_PRIVATE_KEY`
- `GITHUB_APP_INSTALLATION_ID`
- `GITHUB_REPO_OWNER`
- `GITHUB_REPO_NAME`
- `GITHUB_TARGET_BRANCH`
- `SERPAPI_API_KEY`
- `PRODUCT_HUNT_TOKEN`
- `GENERATE_BLOG_IMAGES`

Optional alternatives for competitor market discovery:
- `BRAVE_SEARCH_API_KEY`
- `BING_SEARCH_API_KEY`

`SERPAPI_API_KEY` is used by the shared market search layer for competitor intelligence, lead discovery, SEO/topic research, and trend enrichment.

Competitor intelligence tuning:
- `COMPETITOR_MARKET_PROFILE`
- `COMPETITOR_MARKET_QUERIES`
- `COMPETITOR_SCAN_LIMIT` (default `5`, maximum `10` per cron run)

Compatibility fallback still supported:
- `SOCIAL_AGENT_CRON_SECRET`

## 2) Vercel Cron schedule

The production automation schedule lives in [vercel.json](../vercel.json). Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` automatically when `CRON_SECRET` is configured in the project environment.

Active production jobs:
- `07:15` and `14:15` UTC: trend refresh
- `08:05` UTC: daily content trigger
- `08:50` UTC: social token health check
- `09:20` UTC: social queue publishing
- `09:50` UTC: social engagement lead capture
- `10:30` UTC: daily ops digest
- Tuesdays `13:00` UTC: newsletter weekly send
- Thursdays `13:20` UTC: competitor intelligence scan
- First of month `14:10` UTC: monthly ops report

When `DATABASE_URL` is configured, each scheduled route records a row in the `cron_runs` Postgres table with job name, status, HTTP status, timestamps, duration, and error details.

Keep the matching GitHub Actions workflows manual-only unless Vercel Cron is intentionally disabled. Running both schedulers will duplicate posts, reports, and Slack alerts.

## 3) GitHub Actions secrets

Set these in GitHub Repository Settings -> Secrets and variables -> Actions.

Required by manual fallback workflows in [.github/workflows/daily-blog.yml](../.github/workflows/daily-blog.yml), [.github/workflows/social-publish.yml](../.github/workflows/social-publish.yml), [.github/workflows/trend-refresh.yml](../.github/workflows/trend-refresh.yml), [.github/workflows/newsletter-weekly.yml](../.github/workflows/newsletter-weekly.yml), and [.github/workflows/competitor-scan.yml](../.github/workflows/competitor-scan.yml):
- `OPENAI_API_KEY`
- `CRON_SECRET`
- `NEXT_PUBLIC_BASE_URL`

Optional:
- `GENERATE_BLOG_IMAGES` (`true` or `false`, defaults to `false`)

Notes:
- `GITHUB_TOKEN` is provided automatically by GitHub Actions.
- The production smoke monitor is still scheduled in GitHub Actions because it checks the deployed site from outside Vercel.
- The other GitHub workflows are manual fallbacks; Vercel Cron is the production scheduler.

## 4) Railway scheduler config

Use Railway Cron to call the orchestrator endpoint.

Required Railway variables:
- `RAILWAY_TRIGGER_SECRET`
- `CRON_SECRET`

Recommended:
- `DATABASE_URL` (usually `${{Postgres.DATABASE_URL}}` as a Railway variable reference)
- `AUTOMATION_INTERNAL_BASE_URL`
- `NEXT_PUBLIC_BASE_URL`

Trigger details:
- URL: `https://YOUR_DOMAIN/api/agents/orchestrator/trigger`
- Method: `POST`
- Header: `Authorization: Bearer <RAILWAY_TRIGGER_SECRET>`
- Interval: every 15 minutes

Reference: [docs/railway-orchestrator-setup.md](./railway-orchestrator-setup.md)

## 5) Preflight checks before go-live

Run locally with your env loaded:

```bash
npm run env:check
```

This script validates required and recommended env vars across:
- Vercel runtime
- GitHub workflow triggers
- Railway scheduler

Targeted checks:

```bash
node scripts/validate-prod-env.mjs --target=vercel
node scripts/validate-prod-env.mjs --target=github
node scripts/validate-prod-env.mjs --target=railway
```

Strict mode fails if recommended vars are missing:

```bash
node scripts/validate-prod-env.mjs --target=all --strict
```

## 6) Production smoke tests

After deployment, verify:
- `GET /api/health` returns 200
- Admin login works
- `POST /api/agents/orchestrator/trigger?dryRun=1` with Railway secret returns execution plan
- `GET /api/agents/content/trigger` with `CRON_SECRET` returns 200
- `POST /api/agents/social/trigger` with `CRON_SECRET` returns 200
- `GET /api/agents/trends/cron` with `CRON_SECRET` returns 200
- `GET /api/agents/newsletter/cron` with `CRON_SECRET` returns 200
- `GET /api/agents/competitors/cron` with `CRON_SECRET` returns 200

## 7) Security notes

- Rotate any token that was ever pasted into terminal history or logs.
- Keep `CRON_SECRET` and `RAILWAY_TRIGGER_SECRET` different values.
- Use long random values for `ADMIN_DASHBOARD_SESSION_SECRET`, `OAUTH_STATE_SECRET`, and `TOKEN_STORE_ENCRYPTION_KEY`.
