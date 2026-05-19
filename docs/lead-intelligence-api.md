# Lead Intelligence Service API

Ghost Lead Intelligence can be used as a server-to-server service by Ghost Lead Command.

Set this environment variable in `ghostaisolutions`:

```txt
LEAD_INTELLIGENCE_API_KEY=your-long-random-token
LEAD_INTELLIGENCE_BATCH_LIMIT=25
```

Then set these in `ghost-lead-command`:

```txt
GHOST_LEAD_AGENT_SEARCH_URL=https://ghostai.solutions/api/lead-intelligence/enrich
GHOST_LEAD_AGENT_API_KEY=the-same-token
```

## Health

```http
GET /api/lead-intelligence/health
```

Returns service readiness without exposing secrets.

## Enrich Websites

```http
POST /api/lead-intelligence/enrich
Authorization: Bearer your-long-random-token
Content-Type: application/json

{
  "urls": ["https://example.com"],
  "persist": true,
  "draft": false
}
```

`persist` defaults to `true` and upserts into `.internal/lead-intelligence`. Use `persist:false` when Lead Command only needs a preview.

`draft:true` also generates a first-touch email draft.

## Draft Email

```http
POST /api/lead-intelligence/draft
Authorization: Bearer your-long-random-token
Content-Type: application/json

{
  "leadId": "lead-id-from-storage"
}
```

You can also pass an inline `lead` object instead of `leadId`.

