#!/usr/bin/env node
// scrapers/linkedin.mjs — Job discovery via JSearch RapidAPI
//
// JSearch (by LetscrapeAI) aggregates LinkedIn + Indeed + Glassdoor + ZipRecruiter
// into one REST API. Free tier: 200 requests/month.
//
// API key stored in config/profile.yml under api_keys.jsearch
// Docs: https://rapidapi.com/letscrape-6bfed1765432/api/jsearch
//
// One API call = one query. We make 4 focused queries per scan = 4 requests.
// At every-3-day scans, that's ~40 requests/month — well within free tier.

import { readFileSync } from 'fs';
import { join } from 'path';
import { log } from './lib/common.mjs';

const SOURCE = 'jsearch';
const ROOT = join(import.meta.dirname, '..');

function getApiKey() {
  const profile = readFileSync(join(ROOT, 'config', 'profile.yml'), 'utf8');
  const match = profile.match(/jsearch:\s*["']?([a-zA-Z0-9]+)["']?/);
  if (!match) return null;
  return match[1];
}

const QUERIES = [
  { query: 'Director of Product', remote: true },
  { query: 'Head of Product', remote: true },
  { query: 'Principal Product Manager', remote: true },
  { query: 'Director Marketing Operations', remote: true },
];

async function searchJobs(apiKey, query, remote) {
  const params = new URLSearchParams({
    query: query,
    num_pages: '2',          // 20 results (10/page)
    date_posted: 'week',     // last 7 days
    remote_jobs_only: remote ? 'true' : 'false',
    country: 'US',
  });

  const url = `https://jsearch.p.rapidapi.com/search?${params}`;
  const resp = await fetch(url, {
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'jsearch.p.rapidapi.com',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(`HTTP ${resp.status}: ${body.slice(0, 200)}`);
  }

  const data = await resp.json();
  return (data.data || []).map(job => ({
    title: job.job_title || '',
    company: job.employer_name || '',
    url: job.job_apply_link || job.job_google_link || '',
    source: SOURCE,
    location: job.job_city ? `${job.job_city}, ${job.job_state}` : (job.job_is_remote ? 'Remote' : ''),
    salary_min: job.job_min_salary,
    salary_max: job.job_max_salary,
    posted: job.job_posted_at_datetime_utc || '',
    // JSearch tells us which platform the listing came from
    platform: job.job_publisher || '',
  }));
}

export async function scan() {
  const apiKey = getApiKey();

  if (!apiKey) {
    log(SOURCE, 'No API key found. Add api_keys.jsearch to config/profile.yml');
    log(SOURCE, 'Get a free key at: https://rapidapi.com/letscrape-6bfed1765432/api/jsearch');
    log(SOURCE, 'Format in profile.yml:');
    log(SOURCE, '  api_keys:');
    log(SOURCE, '    jsearch: YOUR_KEY_HERE');
    return [];
  }

  const results = [];

  for (const q of QUERIES) {
    log(SOURCE, `Querying: "${q.query}" (remote=${q.remote})`);

    try {
      const jobs = await searchJobs(apiKey, q.query, q.remote);
      log(SOURCE, `Got ${jobs.length} results for "${q.query}".`);
      results.push(...jobs);
    } catch (err) {
      if (err.message.includes('429')) {
        log(SOURCE, `Rate limited. Monthly quota may be exhausted. Stopping.`);
        break;
      }
      log(SOURCE, `Query error: ${err.message}`);
    }

    // Brief delay between calls
    await new Promise(r => setTimeout(r, 300));
  }

  // Deduplicate (same job may appear in multiple queries or from multiple platforms)
  const seen = new Set();
  const deduped = [];
  for (const r of results) {
    // Normalize URL for dedup (strip tracking params)
    const key = r.url.replace(/[?#].*$/, '').toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(r);
    }
  }

  log(SOURCE, `Total: ${deduped.length} unique results from ${QUERIES.length} queries (${QUERIES.length} API calls used).`);
  return deduped;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/.*\//, ''))) {
  const results = await scan();
  console.log(JSON.stringify(results, null, 2));
}
