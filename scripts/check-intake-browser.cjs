// Local-only, read-only visual and intake QA. No form submissions or external traffic.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = process.env.SEO_CHECK_URL || 'http://127.0.0.1:3100';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname), 'Browser form QA must only run against a local build');
const out = process.env.QA_OUTPUT_DIR || 'qa-results';
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
      await context.route('**/*', route => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin === new URL(base).origin && request.method() === 'GET' && !url.pathname.startsWith('/api/')) return route.continue();
        return route.abort();
      });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      const sitemap = await (await context.request.get(`${base}/sitemap.xml`)).text();
      const article = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname).find(path => path.startsWith('/blog/'));
      for (const path of ['/', '/services', '/work', '/start', article]) {
        await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
        await page.locator('h1').first().waitFor();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true, `horizontal overflow at ${path} ${viewport.width}`);
        await page.screenshot({ path: `${out}/${viewport.width}-${path === '/' ? 'home' : path.split('/').filter(Boolean).join('-')}.png`, fullPage: true });
        results.push({ width: viewport.width, path, title: await page.title(), horizontalOverflow: false });
      }
      for (const offer of ['Ongoing growth support', 'One-time project', 'Recommend the best fit']) {
        await page.goto(`${base}/start`, { waitUntil: 'networkidle' });
        await page.getByLabel('Full name (required)', { exact: true }).fill('Ghost QA Example');
        await page.getByLabel('Work email (required)', { exact: true }).fill('qa@example.com');
        assert.equal(await page.getByLabel('Work email (required)', { exact: true }).getAttribute('type'), 'email');
        assert.equal(await page.getByLabel('Mobile phone (optional)', { exact: true }).getAttribute('type'), 'tel');
        assert.equal(await page.getByRole('link', { name: 'Prefer to start with email?' }).getAttribute('href'), 'mailto:support@ghostai.solutions');
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
        await page.getByRole('button', { name: /Build or redesign a website/ }).click();
        await page.getByLabel('What is the first win you want from this? (required)', { exact: true }).fill('Improve the clarity of our example website.');
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
        await page.getByRole('button', { name: new RegExp(offer) }).click();
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
        await page.getByLabel('Current website URL (optional)', { exact: true }).fill('https://example.com');
        if (offer === 'Ongoing growth support') {
          await page.getByLabel('Business stage (required)', { exact: true }).selectOption('growing');
          await page.getByLabel('Team size (required)', { exact: true }).selectOption('solo');
          await page.getByLabel('Annual revenue range (required)', { exact: true }).selectOption('not-sure');
        } else if (offer === 'One-time project') {
          await page.getByLabel('Website Design', { exact: true }).check();
        } else {
          await page.getByLabel('What feels missing, unclear, outdated, or not working right now? (required)', { exact: true }).fill('Our example site needs clearer navigation.');
        }
        await page.getByLabel('Investment comfort if the plan is a clear fit (required)', { exact: true }).selectOption('not-sure');
        await page.getByLabel('Desired start timeline (required)', { exact: true }).selectOption('planning');
        const unnamed = await page.locator('#blueprint input, #blueprint select, #blueprint textarea').evaluateAll(controls => controls.filter(control => !control.labels?.length && !control.getAttribute('aria-label')).map(control => control.name));
        assert.deepEqual(unnamed, [], 'all rendered intake fields need associated labels');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true);
        await page.screenshot({ path: `${out}/${viewport.width}-${offer.toLowerCase().replaceAll(' ', '-')}-details.png`, fullPage: true });
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
        await page.getByRole('link', { name: 'Send Intake', exact: true }).waitFor();
        await page.getByRole('button', { name: 'Back', exact: true }).click();
        assert.equal(await page.getByLabel('Current website URL (optional)', { exact: true }).inputValue(), 'https://example.com');
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
        await page.getByRole('link', { name: 'Send Intake', exact: true }).waitFor();
        // Stop at review. Even the production API's testMode creates CRM records.
        results.push({ width: viewport.width, offer, labeledFields: true, backAndRepeat: true, submitted: false });
      }
      assert.deepEqual(pageErrors, [], `uncaught browser errors at ${viewport.width}`);
      await context.close();
    }
    fs.writeFileSync(`${out}/results.json`, JSON.stringify({ passed: true, results }, null, 2));
    console.log(`PASS: ${results.length} desktop/mobile page and intake checks. All external traffic and API requests blocked; no submissions.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
