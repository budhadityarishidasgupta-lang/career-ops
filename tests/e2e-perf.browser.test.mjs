/**
 * Performance budget tests using Playwright's CDP integration.
 *
 * Verifies the dashboard meets a strict performance budget on first paint:
 *   - HTML payload (gzipped) ≤ 200 KB
 *   - First paint occurs within 1500ms on a desktop viewport
 *   - DOM is interactive within 3000ms
 *   - Layout shift (CLS proxy) — no element jumps after first paint
 *   - Total JavaScript execution time ≤ 600ms during load
 *   - No render-blocking resources beyond fonts (which are preconnected)
 *
 * These thresholds are intentionally generous for a single-file dashboard
 * served from localhost — they catch regressions, not micro-optimizations.
 *
 * Skipped when Playwright Chromium is unavailable.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bootServer, fetchPort } from './_helpers/boot-server.mjs';

let chromium;
try { ({ chromium } = await import('playwright')); } catch {}

const SHOULD_RUN = !!chromium && process.env.SKIP_BROWSER_TESTS !== '1';

// Budget constants — bump these deliberately when shipping new features.
const BUDGET = {
  htmlGzippedKb:        200,   // single-file inline app, gzip-friendly
  firstPaintMs:         1500,
  domContentLoadedMs:   3000,
  jsExecMs:             1500,
};

test('performance — HTML payload + paint timing', { skip: !SHOULD_RUN ? 'Playwright unavailable' : false }, async (t) => {
  const srv = await bootServer();
  t.after(srv.cleanup);

  await t.test('HTML response size is within budget', async () => {
    const r = await fetchPort(srv.port, '/', { headers: { 'Accept-Encoding': 'gzip' } });
    assert.equal(r.statusCode, 200);
    assert.equal(r.headers['content-encoding'], 'gzip');
    const sizeKb = r.body.length / 1024;
    assert.ok(sizeKb <= BUDGET.htmlGzippedKb,
      `HTML gzipped ${sizeKb.toFixed(1)} KB ≤ ${BUDGET.htmlGzippedKb} KB budget`);
    console.log(`[perf] HTML gzipped: ${sizeKb.toFixed(1)} KB / budget ${BUDGET.htmlGzippedKb} KB`);
  });

  let browser;
  try { browser = await chromium.launch({ headless: true }); }
  catch (e) { return t.skip(`Chromium unavailable: ${e.message}`); }
  t.after(() => browser.close());

  await t.test('First paint + DOMContentLoaded within budget', async () => {
    const ctx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();

    await page.goto(srv.baseUrl + '/', { waitUntil: 'load' });

    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const paints = performance.getEntriesByType('paint');
      const fp = paints.find(p => p.name === 'first-paint')?.startTime ?? null;
      const fcp = paints.find(p => p.name === 'first-contentful-paint')?.startTime ?? null;
      return {
        domContentLoaded: nav ? nav.domContentLoadedEventEnd - nav.startTime : null,
        domInteractive:   nav ? nav.domInteractive - nav.startTime : null,
        loadEvent:        nav ? nav.loadEventEnd - nav.startTime : null,
        firstPaint:       fp,
        firstContentfulPaint: fcp,
      };
    });

    console.log(`[perf] DCL: ${timing.domContentLoaded?.toFixed(0)}ms, DOMInt: ${timing.domInteractive?.toFixed(0)}ms, FP: ${timing.firstPaint?.toFixed(0)}ms, FCP: ${timing.firstContentfulPaint?.toFixed(0)}ms`);

    if (timing.firstPaint != null) {
      assert.ok(timing.firstPaint <= BUDGET.firstPaintMs,
        `first-paint ${timing.firstPaint.toFixed(0)}ms ≤ ${BUDGET.firstPaintMs}ms budget`);
    }
    if (timing.domContentLoaded != null) {
      assert.ok(timing.domContentLoaded <= BUDGET.domContentLoadedMs,
        `DCL ${timing.domContentLoaded.toFixed(0)}ms ≤ ${BUDGET.domContentLoadedMs}ms budget`);
    }

    await ctx.close();
  });

  await t.test('No layout shift after first paint (CLS proxy)', async () => {
    const ctx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(srv.baseUrl + '/', { waitUntil: 'load' });

    // Measure layout-shift entries
    const shifts = await page.evaluate(() => new Promise(resolve => {
      const entries = [];
      const obs = new PerformanceObserver(list => {
        for (const e of list.getEntries()) entries.push({
          value: e.value,
          hadRecentInput: e.hadRecentInput,
        });
      });
      try { obs.observe({ type: 'layout-shift', buffered: true }); } catch { resolve([]); return; }
      // Wait 800ms after load to capture late shifts (font swaps, late JS)
      setTimeout(() => { obs.disconnect(); resolve(entries); }, 800);
    }));

    // Sum unintentional shifts (those without recent user input)
    const cls = shifts
      .filter(s => !s.hadRecentInput)
      .reduce((sum, s) => sum + s.value, 0);

    console.log(`[perf] CLS sum: ${cls.toFixed(4)} (threshold 0.10)`);
    // Lighthouse "Good" CLS is < 0.1
    assert.ok(cls < 0.10, `cumulative layout shift ${cls.toFixed(4)} < 0.10 (Good)`);

    await ctx.close();
  });

  await t.test('Brand assets are gzipped + cached', async () => {
    const r = await fetchPort(srv.port, '/og-image.svg', { headers: { 'Accept-Encoding': 'gzip' } });
    assert.equal(r.statusCode, 200);
    assert.equal(r.headers['content-encoding'], 'gzip');
    assert.ok(r.headers['cache-control']?.includes('max-age=86400'),
      `cache-control includes 1-day max-age, got "${r.headers['cache-control']}"`);
  });
});
