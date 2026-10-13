# SEO and intake foundations: review notes

This is a review-only change set. Do not merge to production until preview verification and owner approval are complete.

## Changes

- Centralized the preferred production origin, https://www.ghostai.solutions, for canonical links, Open Graph URLs, structured data, RSS links, and sitemap entries.
- Removed the root-layout homepage canonical inherited by unrelated pages. Each public page now supplies explicit metadata. Blog articles use their own title, excerpt, canonical, and article Open Graph fields.
- Replaced route scanning with an explicit public sitemap allowlist. All 130 existing articles remain included. Admin, client-portal, internal growth-lab, duplicate /contact, and redirected /privacy URLs are excluded. Static pages no longer claim a new modification date on every build.
- RSS item IDs retain their historical values (as opaque GUIDs) so the host correction does not replay old articles in feed readers.
- /contact remains a working intake alias and canonicalizes to /start. /privacy receives an HTTP 308 to its existing /privacy-policy destination before rendering.
- Added inherited noindex, nofollow directives to admin and client-portal layouts. Authentication, authorization, cookies, API routes, and security configuration are unchanged. Search directives are not access controls.
- Matched the intake heading to the existing homepage's free website audit CTA while retaining CRM, automation, and advanced AI inquiries. No new audit scope, deadline, price, or contract promise was introduced; the previously unverified one-business-day promise was removed from this draft.
- Added persistent associated labels, input types, autocomplete, required/optional descriptions, and accessible email-format feedback across intake fields. The email alternative now opens mailto:support@ghostai.solutions, using the site's existing configured public address.
- Removed the success message's unconditional confirmation-email delivery promise. Submission handling, payloads, offer routing, delivery logic, and SMS consent remain unchanged.

## Verification

Run `npm run lint`, `npm run test:seo`, and `npm run build`. With a local production server on port 3100, run `npm run check:seo` to crawl the entire sitemap and check utility noindex, the contact duplicate, privacy redirect, 404, robots, and RSS.

The pull-request workflow uses the public repository's standard Ubuntu runner with contents-read permissions, no secrets, and no deployment action. It builds the app locally and runs desktop/mobile Playwright checks. The browser script refuses non-local targets, blocks external traffic and all API requests, and stops each intake path at review without submitting. Screenshot artifacts are retained for seven days.

The existing AdminShell image warning and outdated Browserslist notice are unrelated and not fixed by this change.

## Decisions still needed

- The blog index, article footer, and automation-category BlogServiceCTA still contain legacy fixed-fee / no-retainer / ownership wording. Confirm whether this is a separate AI-project offer before rewriting it. Website/CRM recurring service terms should not be inferred from those statements.
- The legacy blog “Free Blueprint” offer and the website audit need a confirmed, consistent deliverable definition. No new pricing or recurring-service terms were published in this PR.
- Dedicated website design, website-plus-CRM, and Tyler/East Texas content needs approved service scope and genuine delivery proof before publication. Do not mass-produce thin city pages or unverified business-result claims.
- The API's current testMode still creates lead records. It is not safe as a no-side-effect dry run. Real submission, CRM routing, and confirmation delivery are deliberately untested here and require an explicitly approved test.
- Technical SEO corrections improve consistency; they do not guarantee indexing, rankings, traffic, or revenue. After an approved production release, inspect the resulting sitemap and representative URLs in Search Console using existing authorized access.

## References

- Google canonical guidance: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Next.js metadata API: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
