#!/usr/bin/env node
// scrapers/wellfound.mjs — Wellfound (AngelList Talent) via stealth Playwright
//
// Wellfound is behind Cloudflare WAF. Strategy:
//   1. Launch browser in headed mode with stealth patches (navigator.webdriver, etc.)
//   2. Wait for Cloudflare challenge to resolve
//   3. Intercept internal API/GraphQL responses for structured data
//   4. Fallback: __NEXT_DATA__ → DOM extraction
//
// If Cloudflare blocks us despite stealth, return 0 gracefully.
// JSearch covers Wellfound listings as a fallback data source.

import { launchBrowser, newStealthPage, waitForCloudflare, log } from './lib/common.mjs';

const SOURCE = 'wellfound';

const SEARCH_URL = 'https://wellfound.com/jobs?role=product_manager&role=marketing&seniority=senior&seniority=lead&seniority=manager&seniority=director&seniority=vp&seniority=executive&remote=true&minSalary=150000';

export async function scan() {
  const results = [];
  const interceptedData = [];
  let browser;

  try {
    // Use headed mode + stealth patches for Cloudflare bypass
    browser = await launchBrowser({ stealth: true });
    const page = await newStealthPage(browser, { cloudflare: true });

    // Intercept API responses
    await page.route('**/*', async (route) => {
      const request = route.request();
      const url = request.url();

      const response = await route.fetch().catch(() => null);
      if (!response) { await route.abort().catch(() => {}); return; }

      const isApi = url.includes('/api/') ||
                    url.includes('/graphql') ||
                    url.includes('swr/') ||
                    (url.includes('wellfound.com') && request.resourceType() === 'xhr');

      if (isApi) {
        try {
          const body = await response.text();
          if (body.includes('jobTitle') || body.includes('job_title') ||
              body.includes('startup') || body.includes('listings') ||
              body.includes('jobListings') || body.includes('roles')) {
            const json = JSON.parse(body);
            interceptedData.push({ url, data: json });
          }
        } catch {}
      }

      await route.fulfill({ response }).catch(() => {});
    });

    log(SOURCE, 'Navigating to Wellfound (stealth + Cloudflare handler)...');
    await page.goto(SEARCH_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for Cloudflare challenge if present
    const passed = await waitForCloudflare(page, 15000);
    if (!passed) {
      log(SOURCE, 'Cloudflare challenge did not resolve in 15s. Wellfound degraded.');
      await browser.close();
      return [];
    }

    // Check if we got a 403 or empty page
    const pageStatus = await page.evaluate(() => {
      const body = document.body?.innerText?.trim() || '';
      if (body.length < 100) return 'empty';
      if (body.includes('403') || body.includes('Access denied')) return 'blocked';
      return 'ok';
    });

    if (pageStatus !== 'ok') {
      log(SOURCE, `Page status: ${pageStatus}. Wellfound is blocking this session.`);
      await browser.close();
      return [];
    }

    log(SOURCE, 'Cloudflare passed. Loading job listings...');
    await page.waitForTimeout(3000);

    // Scroll to trigger lazy-loaded API calls
    for (let i = 0; i < 8; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(1500);
    }
    await page.waitForTimeout(2000);

    log(SOURCE, `Intercepted ${interceptedData.length} API responses.`);

    // Extract from intercepted API data
    for (const { data } of interceptedData) {
      extractJobs(data, results);
    }

    // Fallback 1: __NEXT_DATA__
    if (results.length === 0) {
      log(SOURCE, 'Trying __NEXT_DATA__ extraction...');
      const nextData = await page.evaluate(() => {
        const el = document.querySelector('#__NEXT_DATA__');
        if (el) { try { return JSON.parse(el.textContent); } catch { return null; } }
        return window.__NEXT_DATA__ || null;
      });
      if (nextData) {
        extractJobs(nextData, results);
        log(SOURCE, `__NEXT_DATA__: ${results.length} jobs.`);
      }
    }

    // Fallback 2: DOM extraction
    if (results.length === 0) {
      log(SOURCE, 'Trying DOM extraction...');
      const domJobs = await page.evaluate(() => {
        const jobs = [];
        const links = document.querySelectorAll('a[href*="/jobs/"][href*="-at-"]');
        const seen = new Set();
        for (const link of links) {
          const href = link.getAttribute('href');
          if (!href || seen.has(href)) continue;
          seen.add(href);
          const urlMatch = href.match(/\/jobs\/(.+)-at-([a-z0-9-]+)/i);
          if (!urlMatch) continue;
          const title = link.textContent?.trim()
            || urlMatch[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          const company = urlMatch[2].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          jobs.push({
            title: title.slice(0, 200),
            company,
            url: href.startsWith('http') ? href : `https://wellfound.com${href}`,
          });
        }
        return jobs;
      });
      results.push(...domJobs.map(j => ({ ...j, source: SOURCE })));
      log(SOURCE, `DOM fallback: ${domJobs.length} jobs.`);
    }

    log(SOURCE, `Total: ${results.length} jobs extracted.`);
  } catch (err) {
    log(SOURCE, `ERROR: ${err.message}`);
  } finally {
    if (browser) await browser.close();
  }

  return results;
}

// Recursively walk JSON to find job listing objects
function extractJobs(obj, results, depth = 0) {
  if (depth > 10 || !obj || typeof obj !== 'object') return;
  if (isJobObject(obj)) {
    const job = normalizeJob(obj);
    if (job) results.push(job);
    return;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) extractJobs(item, results, depth + 1);
  } else {
    for (const val of Object.values(obj)) {
      if (val && typeof val === 'object') extractJobs(val, results, depth + 1);
    }
  }
}

function isJobObject(obj) {
  const jobFields = ['jobTitle', 'job_title', 'title', 'name'];
  const companyFields = ['startup', 'company', 'companyName', 'employer', 'organization'];
  const hasTitle = jobFields.some(f => typeof obj[f] === 'string' && obj[f].length > 2);
  const hasCompany = companyFields.some(f =>
    (typeof obj[f] === 'string' && obj[f].length > 1) ||
    (typeof obj[f] === 'object' && obj[f]?.name)
  );
  return hasTitle && hasCompany;
}

function normalizeJob(obj) {
  const title = obj.jobTitle || obj.job_title || obj.title || obj.name || '';
  if (!title || title.length < 3) return null;
  let company = '';
  if (typeof obj.startup === 'object') company = obj.startup?.name || '';
  else if (typeof obj.company === 'object') company = obj.company?.name || '';
  else company = obj.companyName || obj.company || obj.employer || '';
  let url = obj.url || obj.jobUrl || obj.href || '';
  if (obj.slug && !url) url = `https://wellfound.com/jobs/${obj.slug}`;
  if (url && !url.startsWith('http')) url = `https://wellfound.com${url}`;
  if (!url) return null;
  return { title, company, url, source: SOURCE };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/.*\//, ''))) {
  const results = await scan();
  console.log(JSON.stringify(results, null, 2));
}
