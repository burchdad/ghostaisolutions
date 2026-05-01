# Meta Business Login Setup Runbook

This runbook covers production configuration, webhook setup, and App Review readiness for the Ghost AI Solutions Meta integration.

## Implemented Endpoints

- OAuth start: `/api/meta/oauth/start`
- OAuth callback: `/api/meta/oauth/callback`
- Token refresh: `/api/meta/refresh`
- Disconnect/revoke: `/api/meta/disconnect`
- Deauthorize callback: `/api/meta/deauthorize`
- Data deletion callback: `/api/meta/data-deletion`
- Data deletion status: `/api/meta/data-deletion/status/:confirmationCode`
- Lead webhook verify + intake: `/api/meta/webhook`

## Required Environment Variables

Set these in production:

- `META_APP_ID`
- `META_APP_SECRET`
- `META_REDIRECT_URI`
- `META_WEBHOOK_VERIFY_TOKEN`
- `TOKEN_STORE_ENCRYPTION_KEY`

Compatibility fallback variables already supported:

- `FACEBOOK_APP_SECRET` (used if `META_APP_SECRET` missing)

## Production Checklist

1. Confirm `META_REDIRECT_URI` uses `https://` and exactly matches the URI configured in the Meta app.
2. Confirm `TOKEN_STORE_ENCRYPTION_KEY` is set and rotated using your secrets process.
3. Enable HTTPS-only traffic at the edge/proxy layer.
4. Ensure `.internal/` paths are not publicly served.
5. Confirm admin login/session secret is configured before using connect/disconnect actions.

## Meta App Dashboard Configuration

### 1) Facebook Login / Business Login

- Valid OAuth Redirect URI:
  - `https://ghostai.solutions/api/meta/oauth/callback`

### 2) Deauthorization Callback

- `https://ghostai.solutions/api/meta/deauthorize`

### 3) Data Deletion Callback

- `https://ghostai.solutions/api/meta/data-deletion`

### 4) Webhooks

- Callback URL:
  - `https://ghostai.solutions/api/meta/webhook`
- Verify token:
  - must match `META_WEBHOOK_VERIFY_TOKEN`
- Subscribe to relevant `page` fields:
  - `leadgen`

## Scope Guidance

Current OAuth flow requests:

- `pages_show_list`
- `pages_manage_metadata`
- `pages_read_engagement`
- `pages_manage_posts`
- `pages_read_user_content`
- `instagram_basic`
- `instagram_manage_insights`
- `business_management`
- `ads_management`
- `ads_read`
- `leads_retrieval`

Only request scopes actually needed in your reviewed app flow.

## Verification Test Plan

### OAuth Connect

1. Log into admin and open `/admin/agents/social/facebook`.
2. Click `Connect Meta Account`.
3. Complete Meta consent flow.
4. Verify connected profile and assets appear (Pages, Instagram, Ad Accounts, Business Managers).

### Refresh / Disconnect

1. Click `Refresh Token` and verify success message.
2. Click `Disconnect` and verify connection state resets.

### Deauthorize

1. Trigger deauthorization from Meta app settings.
2. Confirm `/api/meta/deauthorize` receives and processes request.
3. Confirm stored Meta/Facebook provider tokens are removed for the app-scoped user.

### Data Deletion

1. Trigger deletion request through Meta test tools.
2. Confirm `/api/meta/data-deletion` returns `confirmation_code` and status URL.
3. Confirm status endpoint responds with completion status.

### Lead Webhook

1. Complete a Meta lead form test submission.
2. Verify webhook POST is accepted with valid `x-hub-signature-256`.
3. Confirm lead record is created/upserted in lead store.

## Audit and Troubleshooting

Audit logs are written to:

- `.internal/audit/meta-oauth.log`
- `.internal/audit/meta-webhook.log`

If webhooks fail:

1. Confirm signature validation secret (`META_APP_SECRET`) is correct.
2. Confirm webhook payload object is `page` and field includes `leadgen`.
3. Confirm page access token is available via stored Facebook provider connection or env fallback.

If OAuth fails:

1. Check callback URI exact match in Meta app.
2. Check app mode and role assignment for test users.
3. Check env vars and deployment secret availability.
