// scrapers/lib/common.mjs — Shared utilities for all career-ops scrapers
import { readFileSync, existsSync, appendFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { chromium } from 'playwright';

const ROOT = join(import.meta.dirname, '..', '..');

// ── Config loading ──

export function loadProfile() {
  const raw = readFileSync(join(ROOT, 'config', 'profile.yml'), 'utf8');
  return raw;
}

export function loadTitleFilters() {
  const raw = readFileSync(join(ROOT, 'portals.yml'), 'utf8');
  const positive = [];
  const negative = [];
  let section = null;
  let inTitleFilter = false;

  for (const line of raw.split('\n')) {
    if (line.match(/^title_filter:/)) { inTitleFilter = true; continue; }
    if (inTitleFilter && line.match(/^\S/) && !line.match(/^\s/)) { inTitleFilter = false; continue; }
    if (!inTitleFilter) continue;

    if (line.match(/^\s+positive:/)) { section = 'positive'; continue; }
    if (line.match(/^\s+negative:/)) { section = 'negative'; continue; }
    if (line.match(/^\s+seniority_boost:/)) { section = null; continue; }

    const m = line.match(/^\s+-\s+"(.+)"/);
    if (m && section === 'positive') positive.push(m[1].toLowerCase());
    if (m && section === 'negative') negative.push(m[1].toLowerCase());
  }
  return { positive, negative };
}

// ── Title filtering ──

export function matchesTitle(title, filters) {
  const lower = title.toLowerCase();
  const hasPositive = filters.positive.some(kw => lower.includes(kw));
  const hasNegative = filters.negative.some(kw => lower.includes(kw));
  return hasPositive && !hasNegative;
}

// ── Deduplication ──

export function loadSeenUrls() {
  const seen = new Set();

  // scan-history.tsv
  const histPath = join(ROOT, 'data', 'scan-history.tsv');
  if (existsSync(histPath)) {
    for (const line of readFileSync(histPath, 'utf8').split('\n').slice(1)) {
      const url = line.split('\t')[0];
      if (url) seen.add(url);
    }
  }

  // applications.md — extract URLs from report links and notes
  const appPath = join(ROOT, 'data', 'applications.md');
  if (existsSync(appPath)) {
    const content = readFileSync(appPath, 'utf8');
    for (const m of content.matchAll(/https?:\/\/[^\s|)]+/g)) {
      seen.add(m[0]);
    }
    // Also extract company+role combos for fuzzy dedup
    for (const line of content.split('\n')) {
      if (!line.startsWith('|') || line.includes('---')) continue;
      const cols = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 4 && cols[0] !== '#') {
        seen.add(`${cols[2].toLowerCase()}::${cols[3].toLowerCase()}`);
      }
    }
  }

  // pipeline.md
  const pipePath = join(ROOT, 'data', 'pipeline.md');
  if (existsSync(pipePath)) {
    for (const m of readFileSync(pipePath, 'utf8').matchAll(/https?:\/\/[^\s|)]+/g)) {
      seen.add(m[0]);
    }
  }

  return seen;
}

export function isDuplicate(result, seenUrls) {
  if (seenUrls.has(result.url)) return true;
  const fuzzyKey = `${result.company.toLowerCase()}::${result.title.toLowerCase()}`;
  if (seenUrls.has(fuzzyKey)) return true;
  return false;
}

// ── TSV output ──

const HISTORY_PATH = join(ROOT, 'data', 'scan-history.tsv');

export function ensureHistoryFile() {
  if (!existsSync(HISTORY_PATH)) {
    writeFileSync(HISTORY_PATH, 'url\tfirst_seen\tportal\ttitle\tcompany\tstatus\n');
  }
}

export function appendToHistory(result, status) {
  ensureHistoryFile();
  const today = new Date().toISOString().slice(0, 10);
  const line = `${result.url}\t${today}\t${result.source}\t${result.title}\t${result.company}\t${status}\n`;
  appendFileSync(HISTORY_PATH, line);
}

// ── Pipeline output ──

const PIPELINE_PATH = join(ROOT, 'data', 'pipeline.md');

export function ensurePipelineFile() {
  if (!existsSync(PIPELINE_PATH)) {
    writeFileSync(PIPELINE_PATH, '# Pipeline — Pending Offers\n\n## Pending\n');
  }
}

export function appendToPipeline(result) {
  ensurePipelineFile();
  appendFileSync(PIPELINE_PATH, `- [ ] ${result.url} | ${result.company} | ${result.title}\n`);
}

// ── Browser helpers ──

export async function launchBrowser({ stealth = false } = {}) {
  return chromium.launch({
    headless: stealth ? false : true,  // Headed mode for Cloudflare-protected sites
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });
}

export async function newStealthPage(browser, { cloudflare = false } = {}) {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    // Stealth: disable webdriver detection signals
    javaScriptEnabled: true,
    bypassCSP: true,
  });

  const page = await context.newPage();

  // Patch navigator.webdriver (Cloudflare's #1 detection signal)
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    // Patch chrome runtime (signal #2)
    window.chrome = { runtime: {}, loadTimes: () => {}, csi: () => {} };
    // Patch permissions query (signal #3)
    const origQuery = window.navigator.permissions?.query;
    if (origQuery) {
      window.navigator.permissions.query = (params) =>
        params.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission })
          : origQuery(params);
    }
    // Patch plugins length (signal #4)
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });
  });

  return page;
}

// Wait for Cloudflare challenge to resolve (if present)
export async function waitForCloudflare(page, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const isChallenging = await page.evaluate(() => {
      const body = document.body?.innerText || '';
      return body.includes('Checking your browser') ||
             body.includes('Just a moment') ||
             body.includes('Verifying you are human') ||
             document.querySelector('#challenge-running') !== null ||
             document.querySelector('.cf-browser-verification') !== null;
    }).catch(() => false);

    if (!isChallenging) return true;
    await page.waitForTimeout(1000);
  }
  return false;
}

// ── Logging ──

export function log(source, msg) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`[${ts}] [${source}] ${msg}`);
}

// ── Results collector ──

export function processResults(results, source, filters, seenUrls) {
  const stats = { found: 0, filtered: 0, duped: 0, added: 0 };

  for (const r of results) {
    r.source = r.source || source;
    stats.found++;

    if (!matchesTitle(r.title, filters)) {
      appendToHistory(r, 'skipped_title');
      stats.filtered++;
      continue;
    }

    if (isDuplicate(r, seenUrls)) {
      appendToHistory(r, 'skipped_dup');
      stats.duped++;
      continue;
    }

    appendToHistory(r, 'added');
    appendToPipeline(r);
    seenUrls.add(r.url);
    seenUrls.add(`${r.company.toLowerCase()}::${r.title.toLowerCase()}`);
    stats.added++;
  }
  return stats;
}
