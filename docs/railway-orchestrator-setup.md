# Railway Orchestrator Setup

This project now supports a single adaptive scheduler driven by the Orchestrator Agent.

## Why this setup

Instead of managing many independent cron definitions across Vercel and GitHub Actions, Railway can call one endpoint at a fixed heartbeat. The orchestrator then decides what to run and when based on trend intensity.

## Trigger endpoint

Use this endpoint from Railway Cron:

- Path: `/api/agents/orchestrator/trigger`
- Method: `POST`
- Header: `Authorization: Bearer $RAILWAY_TRIGGER_SECRET`

Optional query params:

- `dryRun=1` to inspect what would run without executing jobs
- `task=trends|content|social|newsletter|competitors` to force a single task

## Recommended Railway cron

- Frequency: every 15 minutes
- HTTP target: `https://YOUR_DOMAIN/api/agents/orchestrator/trigger`
- Method: `POST`
- Header: `Authorization: Bearer <RAILWAY_TRIGGER_SECRET>`

## Required environment variables

- `RAILWAY_TRIGGER_SECRET`: Auth secret for Railway calling orchestrator
- `CRON_SECRET`: Internal secret used by orchestrator to call existing agent cron endpoints

## Optional environment variables

- `AUTOMATION_INTERNAL_BASE_URL`: Explicit base URL used by orchestrator to call internal endpoints
  - Example: `https://ghostai.solutions`
  - If omitted, orchestrator derives host from request headers.

## Admin control center

- Open: `/admin/agents/orchestrator`

Capabilities:

- View trend pressure and adaptive interval decisions
- Manually run full adaptive cycle
- Dry run execution plan
- Force specific task execution

## Notes on legacy schedulers

- Keep GitHub workflows for manual fallback (`workflow_dispatch`)
- Remove or disable Vercel cron entries to avoid duplicate runs when Railway is active
