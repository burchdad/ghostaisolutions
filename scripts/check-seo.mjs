// Read-only crawl of a running local build or authorized preview. Never submits a form.
import assert from 'node:assert/strict';
import { SITE_ORIGIN, INDEXABLE_ROUTES, canonicalUrl } from '../lib/seo.mjs';
const base = (process.env.SEO_CHECK_URL || 'http://127.0.0.1:3100').replace(/\/$/, '');
const get = async (path) => {
  const response = await fetch(`${base}${path}`, { redirect: 'manual' });
  return { response, html: await response.text() };
};
const sitemap = await get('/sitemap.xml');
assert.equal(sitemap.response.status, 200);
const urls = [...sitemap.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.equal(new Set(urls).size, urls.length);
assert.ok(urls.length >= INDEXABLE_ROUTES.length);
for (const path of INDEXABLE_ROUTES) assert.ok(urls.includes(canonicalUrl(path)), `${path} missing from sitemap`);
for (const url of urls) {
  assert.ok(url === SITE_ORIGIN || url.startsWith(`${SITE_ORIGIN}/`), `wrong host: ${url}`);
  const path = new URL(url).pathname;
  assert.ok(!/^\/(admin|client-portal|api|contact|privacy)(\/|$)/.test(path), `utility/duplicate in sitemap: ${path}`);
  const { response, html } = await get(path);
  assert.equal(response.status, 200, `non-200 sitemap entry: ${path}`);
  const canonicals = [...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/g)].map(match => match[1]);
  assert.deepEqual(canonicals, [url], `canonical mismatch: ${path}`);
  assert.ok(!/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html), `noindex sitemap entry: ${path}`);
  if (path.startsWith('/blog/')) {
    assert.ok(!html.includes('<title>Ghost AI Solutions - Websites, Automation, and AI Systems</title>'), `generic article title: ${path}`);
    assert.ok(html.includes('<meta property="og:type" content="article"'), `missing article metadata: ${path}`);
  }
}
for (const path of ['/admin/login', '/client-portal', '/client-portal/sign-in', '/client-portal/create-account', '/client-portal/reset-password', '/client-portal/proposal-thank-you']) {
  const { response, html } = await get(path);
  assert.equal(response.status, 200, `utility route unavailable: ${path}`);
  assert.match(html, /<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/, `utility lacks noindex: ${path}`);
}
const contact = await get('/contact');
assert.equal(contact.response.status, 200);
assert.ok(contact.html.includes(`rel="canonical" href="${SITE_ORIGIN}/start"`));
const privacy = await get('/privacy');
assert.equal(privacy.response.status, 308);
assert.equal(privacy.response.headers.get('location'), '/privacy-policy');
const missing = await get('/blog/ghost-seo-test-not-a-real-post');
assert.equal(missing.response.status, 404);
const robots = await get('/robots.txt');
assert.ok(robots.html.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`));
const feed = await get('/feed');
assert.equal(feed.response.status, 200);
assert.ok(feed.html.includes(`<link>${SITE_ORIGIN}/blog/`));
console.log(`PASS: ${urls.length} sitemap pages have successful, indexable, self-canonical responses; utility noindex, duplicate, redirect, missing-post, robots and RSS checks passed.`);
