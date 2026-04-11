#!/usr/bin/env node
// discover-ats-slugs.mjs — Auto-discover new Greenhouse and Lever board slugs
//
// Greenhouse and Lever don't publish master indexes, but we can discover new boards by:
//   1. Google-searching for job boards on each platform filtered to PM/Director roles
//   2. Checking if discovered slugs have active PM/Director listings via API
//   3. Merging new valid slugs into the scraper discovery arrays
//
// Run monthly: node discover-ats-slugs.mjs
// Or via npm: npm run discover-slugs
//
// Output: scrapers/data/discovered-slugs.json (persistent cache)
//         Prints shell commands to update the scraper files if new slugs found

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { chromium } from 'playwright';

const ROOT = import.meta.dirname;
const CACHE_DIR = join(ROOT, 'scrapers', 'data');
const CACHE_FILE = join(CACHE_DIR, 'discovered-slugs.json');
const GH_SCRAPER = join(ROOT, 'scrapers', 'greenhouse-agg.mjs');
const LV_SCRAPER = join(ROOT, 'scrapers', 'lever-agg.mjs');

const log = (msg) => console.log(`[${new Date().toISOString().slice(0, 19).replace('T', ' ')}] ${msg}`);

// ── Load existing state ──

function loadCache() {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
  if (!existsSync(CACHE_FILE)) return { greenhouse: [], lever: [], lastRun: null };
  return JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
}

function saveCache(cache) {
  cache.lastRun = new Date().toISOString();
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function getExistingSlugs(scraperFile) {
  const content = readFileSync(scraperFile, 'utf8');
  const match = content.match(/DISCOVERY_SLUGS\s*=\s*\[([\s\S]*?)\];/);
  if (!match) return new Set();
  const slugs = new Set();
  for (const m of match[1].matchAll(/'([^']+)'/g)) slugs.add(m[1]);
  return slugs;
}

// ── Discovery via Google Search ──

async function discoverViaSearch(browser) {
  const page = await browser.newPage();
  const discovered = { greenhouse: new Set(), lever: new Set() };

  const searches = [
    // Greenhouse PM/Director boards
    { query: 'site:job-boards.greenhouse.io "Director of Product" OR "Head of Product" OR "Principal Product Manager"', platform: 'greenhouse' },
    { query: 'site:job-boards.greenhouse.io "Director" "Product Management"', platform: 'greenhouse' },
    { query: 'site:job-boards.greenhouse.io "Marketing Operations" "Director" OR "Head"', platform: 'greenhouse' },
    { query: 'site:boards.greenhouse.io "Director of Product" OR "Principal PM"', platform: 'greenhouse' },
    // Lever PM/Director boards
    { query: 'site:jobs.lever.co "Director of Product" OR "Head of Product" OR "Principal Product Manager"', platform: 'lever' },
    { query: 'site:jobs.lever.co "Director" "Product Management"', platform: 'lever' },
    { query: 'site:jobs.lever.co "Marketing Operations" "Director"', platform: 'lever' },
  ];

  for (const search of searches) {
    log(`Searching: ${search.query.slice(0, 80)}...`);
    try {
      const url = `https://www.google.com/search?q=${encodeURIComponent(search.query)}&num=50`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);

      const links = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a[href]'))
          .map(a => a.href)
          .filter(h => h.includes('greenhouse.io') || h.includes('lever.co'))
      );

      for (const link of links) {
        if (search.platform === 'greenhouse') {
          // Extract slug from: job-boards.greenhouse.io/{slug}/... or boards.greenhouse.io/{slug}/...
          const m = link.match(/(?:job-boards|boards)\.greenhouse\.io\/([a-z0-9][a-z0-9-]*?)(?:\/|$)/i);
          if (m && m[1] !== 'v1') discovered.greenhouse.add(m[1].toLowerCase());
        } else {
          // Extract slug from: jobs.lever.co/{slug}/...
          const m = link.match(/jobs\.lever\.co\/([a-z0-9][a-z0-9-]*?)(?:\/|$)/i);
          if (m) discovered.lever.add(m[1].toLowerCase());
        }
      }

      // Check for CAPTCHA
      const blocked = await page.evaluate(() =>
        document.body?.innerText?.includes('unusual traffic') || false
      );
      if (blocked) {
        log('Google CAPTCHA detected. Stopping search discovery.');
        break;
      }

      await page.waitForTimeout(3000 + Math.random() * 2000);
    } catch (err) {
      log(`Search error: ${err.message}`);
    }
  }

  await page.close();
  return { greenhouse: [...discovered.greenhouse], lever: [...discovered.lever] };
}

// ── Validate slugs have active PM/Director listings ──

async function validateGreenhouseSlugs(slugs) {
  const valid = [];
  const pmPattern = /product\s*manag|director.*product|head\s*of\s*product|principal\s*(pm|product)|marketing\s*operations|martech/i;

  log(`Validating ${slugs.length} Greenhouse slugs...`);

  for (let i = 0; i < slugs.length; i += 10) {
    const batch = slugs.slice(i, i + 10);
    const results = await Promise.all(batch.map(async (slug) => {
      try {
        const resp = await fetch(
          `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (!resp.ok) return null;
        const data = await resp.json();
        const jobs = data.jobs || [];
        const hasPm = jobs.some(j => pmPattern.test(j.title));
        return hasPm ? { slug, name: data.name || slug, jobCount: jobs.length } : null;
      } catch {
        return null;
      }
    }));

    for (const r of results) {
      if (r) valid.push(r);
    }
  }

  return valid;
}

async function validateLeverSlugs(slugs) {
  const valid = [];
  const pmPattern = /product\s*manag|director.*product|head\s*of\s*product|principal\s*(pm|product)|marketing\s*operations|martech/i;

  log(`Validating ${slugs.length} Lever slugs...`);

  for (let i = 0; i < slugs.length; i += 10) {
    const batch = slugs.slice(i, i + 10);
    const results = await Promise.all(batch.map(async (slug) => {
      try {
        const resp = await fetch(
          `https://api.lever.co/v0/postings/${slug}?mode=json`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (!resp.ok) return null;
        const data = await resp.json();
        if (!Array.isArray(data)) return null;
        const hasPm = data.some(j => pmPattern.test(j.text));
        return hasPm ? { slug, jobCount: data.length } : null;
      } catch {
        return null;
      }
    }));

    for (const r of results) {
      if (r) valid.push(r);
    }
  }

  return valid;
}

// ── Update scraper files ──

function updateScraperFile(filePath, newSlugs, platform) {
  if (newSlugs.length === 0) return 0;

  let content = readFileSync(filePath, 'utf8');
  const match = content.match(/(DISCOVERY_SLUGS\s*=\s*\[)([\s\S]*?)(\];)/);
  if (!match) {
    log(`WARNING: Could not find DISCOVERY_SLUGS in ${filePath}`);
    return 0;
  }

  // Add new slugs as a commented section at the end of the array
  const today = new Date().toISOString().slice(0, 10);
  const newSection = `\n  // Auto-discovered ${today}\n` +
    newSlugs.map(s => `  '${s}',`).join('\n') + '\n';

  const existingContent = match[2];
  // Remove trailing comma/whitespace before closing bracket
  const cleanExisting = existingContent.replace(/,?\s*$/, ',');

  content = content.replace(match[0], `${match[1]}${cleanExisting}${newSection}${match[3]}`);
  writeFileSync(filePath, content);
  return newSlugs.length;
}

// ── Main ──

async function main() {
  console.log('\n━━━ ATS Slug Discovery ━━━\n');

  const cache = loadCache();
  const existingGh = getExistingSlugs(GH_SCRAPER);
  const existingLv = getExistingSlugs(LV_SCRAPER);
  const allKnown = { greenhouse: existingGh, lever: existingLv };

  log(`Known slugs: ${existingGh.size} Greenhouse, ${existingLv.size} Lever`);

  // Step 1: Discover via Google
  let browser;
  let searchResults = { greenhouse: [], lever: [] };
  try {
    browser = await chromium.launch({ headless: true });
    searchResults = await discoverViaSearch(browser);
  } catch (err) {
    log(`Browser discovery error: ${err.message}`);
  } finally {
    if (browser) await browser.close();
  }

  // Filter out already-known slugs
  const newGhCandidates = searchResults.greenhouse.filter(s => !allKnown.greenhouse.has(s));
  const newLvCandidates = searchResults.lever.filter(s => !allKnown.lever.has(s));

  log(`Discovered: ${newGhCandidates.length} new Greenhouse candidates, ${newLvCandidates.length} new Lever candidates`);

  // Also check previously discovered slugs that weren't validated yet
  const cachedGh = (cache.greenhouse || []).filter(s => !allKnown.greenhouse.has(s));
  const cachedLv = (cache.lever || []).filter(s => !allKnown.lever.has(s));

  const ghToValidate = [...new Set([...newGhCandidates, ...cachedGh])];
  const lvToValidate = [...new Set([...newLvCandidates, ...cachedLv])];

  // Step 2: Validate — do they have PM/Director roles?
  const validGh = await validateGreenhouseSlugs(ghToValidate);
  const validLv = await validateLeverSlugs(lvToValidate);

  log(`Validated: ${validGh.length} Greenhouse boards with PM roles, ${validLv.length} Lever boards`);

  // Step 3: Update scraper files
  const ghSlugsToAdd = validGh.map(v => v.slug);
  const lvSlugsToAdd = validLv.map(v => v.slug);

  const ghAdded = updateScraperFile(GH_SCRAPER, ghSlugsToAdd, 'greenhouse');
  const lvAdded = updateScraperFile(LV_SCRAPER, lvSlugsToAdd, 'lever');

  // Update cache with all discovered (including unvalidated, for next run)
  cache.greenhouse = [...new Set([...(cache.greenhouse || []), ...searchResults.greenhouse])];
  cache.lever = [...new Set([...(cache.lever || []), ...searchResults.lever])];
  saveCache(cache);

  // Summary
  console.log('\n━━━ Results ━━━\n');
  console.log(`Google discovery: ${searchResults.greenhouse.length} GH + ${searchResults.lever.length} Lever candidates`);
  console.log(`New + validated:  ${ghAdded} GH + ${lvAdded} Lever slugs added to scrapers`);

  if (validGh.length > 0) {
    console.log('\nNew Greenhouse boards:');
    for (const v of validGh) console.log(`  + ${v.name || v.slug} (${v.jobCount} jobs)`);
  }
  if (validLv.length > 0) {
    console.log('\nNew Lever boards:');
    for (const v of validLv) console.log(`  + ${v.slug} (${v.jobCount} jobs)`);
  }
  if (ghAdded === 0 && lvAdded === 0) {
    console.log('\nNo new boards found. Existing coverage is good.');
  }

  console.log(`\nCache saved to ${CACHE_FILE}`);
  console.log('Next: run `node scan-all.mjs` to scan with updated boards.');
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
