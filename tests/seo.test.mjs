import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { canonicalUrl, pageMetadata, sitemapEntries, INDEXABLE_ROUTES, SITE_ORIGIN } from '../lib/seo.mjs';

test('canonical URLs use the production www host and remove tracking/fragments', () => {
  assert.equal(canonicalUrl('/'), SITE_ORIGIN);
  assert.equal(canonicalUrl('/services/'), `${SITE_ORIGIN}/services`);
  assert.equal(canonicalUrl('/start?utm_source=test#blueprint'), `${SITE_ORIGIN}/start`);
});

test('page metadata is self-canonical and retains page-specific social metadata', () => {
  const metadata = pageMetadata('/blog/test', {
    title: 'Article title', description: 'Article excerpt',
    openGraph: { type: 'article', publishedTime: '2026-10-13' },
  });
  assert.equal(metadata.alternates.canonical, `${SITE_ORIGIN}/blog/test`);
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
  assert.equal(metadata.openGraph.type, 'article');
  assert.equal(metadata.openGraph.title, 'Article title');
  assert.deepEqual(metadata.openGraph.images, [`${SITE_ORIGIN}/og-image.png`]);
  assert.deepEqual(metadata.twitter.images, [`${SITE_ORIGIN}/og-image.png`]);
  assert.equal(metadata.twitter.description, 'Article excerpt');
  assert.equal(metadata.alternates.types['application/rss+xml'], '/feed');
});

test('sitemap excludes utility/duplicate routes and retains every reviewed public route', () => {
  const entries = sitemapEntries();
  assert.equal(new Set(entries.map(entry => entry.url)).size, INDEXABLE_ROUTES.length);
  for (const entry of entries) {
    assert.ok(entry.url === SITE_ORIGIN || entry.url.startsWith(`${SITE_ORIGIN}/`));
    assert.ok(!/\/(admin|client-portal|api|contact|privacy)(\/|$)/.test(entry.url));
    assert.equal(entry.lastModified, undefined, 'static pages must not receive a fake build-time modification date');
  }
  for (const route of INDEXABLE_ROUTES) {
    const path = route === '/' ? 'app/page.js' : `app${route}/page.js`;
    assert.ok(fs.existsSync(path), `missing page for ${route}`);
    assert.ok(fs.readFileSync(path, 'utf8').includes(`pageMetadata("${route}"`), `${route} lacks explicit metadata`);
  }
});

test('blog sitemap entries are canonical, deduplicated and use valid content dates', () => {
  const entries = sitemapEntries([
    { slug: 'first-post', date: '2026-10-13' },
    { slug: 'first-post', date: '2026-10-13' },
    { slug: 'second-post', date: 'invalid' },
    { slug: '../admin' },
  ]).filter(entry => entry.url.includes('/blog/'));
  assert.equal(entries.length, 2);
  assert.equal(entries[0].lastModified, '2026-10-13T00:00:00.000Z');
  assert.equal(entries[1].lastModified, undefined);
});

test('duplicate contact route chooses start without redirecting or changing intake behavior', () => {
  assert.ok(fs.readFileSync('app/contact/page.js', 'utf8').includes('pageMetadata("/start"'));
  assert.ok(!fs.readFileSync('app/layout.js', 'utf8').includes('canonical:'));
});

test('admin and client-portal layouts inherit noindex without authentication changes', () => {
  for (const section of ['admin', 'client-portal']) {
    assert.match(fs.readFileSync(`app/${section}/layout.js`, 'utf8'), /robots: \{ index: false, follow: false \}/);
  }
});
