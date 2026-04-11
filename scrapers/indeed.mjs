#!/usr/bin/env node
// scrapers/indeed.mjs — Indeed job discovery via structured feed endpoints
//
// Indeed has locked down their RSS endpoint (403). Strategy:
//   1. Primary: Indeed's employer search API (returns JSON when Accept: application/json)
//   2. Fallback: Parse Indeed's HTML search results (simpler than full Playwright)
//
// KNOWN LIMITATION: Indeed blocks server-side fetches (even with realistic headers).
// This scraper will return 0 results unless Indeed relaxes their WAF. The primary
// Indeed coverage comes from JSearch (scrapers/linkedin.mjs) which has official
// API-level access to Indeed listings. This scraper exists as a fallback if
// Indeed's HTML becomes parseable in the future.

import { log } from './lib/common.mjs';

const SOURCE = 'indeed';

const QUERIES = [
  'Director of Product remote',
  'Head of Product remote',
  'Principal Product Manager remote',
  'Senior Director Product Management remote',
  'Director Marketing Operations remote',
  'Head of Marketing Operations remote',
];

async function fetchIndeedSearch(query) {
  // Indeed's search page can be fetched as plain HTML without a browser.
  // We parse the embedded JSON-LD / structured data from the response.
  const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}&fromage=7&sort=date&limit=25`;

  const resp = await fetch(url, {
    headers: {
      'Accept': 'text/html',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(12000),
    redirect: 'follow',
  });

  if (!resp.ok) return [];

  const html = await resp.text();

  // Strategy 1: Extract from JSON-LD structured data (most reliable)
  const results = [];
  const jsonLdMatches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  for (const m of jsonLdMatches) {
    try {
      const data = JSON.parse(m[1]);
      // Indeed embeds ItemList or JobPosting schema
      if (data['@type'] === 'ItemList' && data.itemListElement) {
        for (const item of data.itemListElement) {
          const posting = item.item || item;
          if (posting['@type'] === 'JobPosting') {
            results.push({
              title: posting.title || '',
              company: posting.hiringOrganization?.name || '',
              url: posting.url || '',
              source: SOURCE,
            });
          }
        }
      } else if (data['@type'] === 'JobPosting') {
        results.push({
          title: data.title || '',
          company: data.hiringOrganization?.name || '',
          url: data.url || '',
          source: SOURCE,
        });
      }
    } catch {}
  }

  if (results.length > 0) return results;

  // Strategy 2: Extract from window.mosaic.providerData (Indeed's client-side data)
  const mosaicMatch = html.match(/window\.mosaic\.providerData\["mosaic-provider-jobcards"\]\s*=\s*({[\s\S]*?});/);
  if (mosaicMatch) {
    try {
      const data = JSON.parse(mosaicMatch[1]);
      const cards = data?.metaData?.mosaicProviderJobCardsModel?.results || [];
      for (const card of cards) {
        const jk = card.jobkey || card.jk || '';
        results.push({
          title: card.title || card.displayTitle || '',
          company: card.company || card.companyName || '',
          url: jk ? `https://www.indeed.com/viewjob?jk=${jk}` : '',
          source: SOURCE,
        });
      }
    } catch {}
  }

  if (results.length > 0) return results;

  // Strategy 3: Regex extraction from HTML (last resort)
  const cardRegex = /data-jk="([^"]+)"[\s\S]*?jobTitle[^>]*>([^<]+)<[\s\S]*?companyName[^>]*>([^<]+)</g;
  let match;
  while ((match = cardRegex.exec(html)) !== null) {
    results.push({
      title: match[2].trim(),
      company: match[3].trim(),
      url: `https://www.indeed.com/viewjob?jk=${match[1]}`,
      source: SOURCE,
    });
  }

  return results;
}

export async function scan() {
  const allResults = [];

  for (const query of QUERIES) {
    log(SOURCE, `Searching: ${query}`);

    try {
      const results = await fetchIndeedSearch(query);
      log(SOURCE, `Found ${results.length} results.`);
      allResults.push(...results);
    } catch (err) {
      log(SOURCE, `Error: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 800));
  }

  // Deduplicate across queries
  const seen = new Set();
  const deduped = [];
  for (const r of allResults) {
    if (r.url && !seen.has(r.url)) {
      seen.add(r.url);
      deduped.push(r);
    }
  }

  log(SOURCE, `Total: ${deduped.length} unique results from ${QUERIES.length} searches.`);
  return deduped;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/.*\//, ''))) {
  const results = await scan();
  console.log(JSON.stringify(results, null, 2));
}
