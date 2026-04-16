import { chromium } from 'playwright';

/**
 * Indeed India Scraper
 * Direct scraping of in.indeed.com search results.
 */
export async function scrapeIndeed(keywords, location = 'India') {
  console.log(`\n🔵 Indeed India Scraper — ${keywords} in ${location}`);
  const jobs = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    // Pattern: https://in.indeed.com/jobs?q=keywords&l=location
    const searchUrl = `https://in.indeed.com/jobs?q=${encodeURIComponent(keywords)}&l=${encodeURIComponent(location)}`;
    console.log(`  🌐 Navigating to: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for job cards
    await page.waitForSelector('.job_seen_beacon', { timeout: 15000 }).catch(() => null);

    const results = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.job_seen_beacon'));
      return cards.map(card => {
        const titleEl = card.querySelector('.jobTitle');
        const companyEl = card.querySelector('.companyName, .css-1h4s4h5, [data-testid="company-name"]');
        const linkEl = card.querySelector('a[data-jk]');
        
        if (titleEl && linkEl) {
          return {
            title: titleEl.innerText.trim(),
            company: companyEl ? companyEl.innerText.trim() : 'Unknown',
            url: linkEl.href
          };
        }
        return null;
      }).filter(Boolean);
    });

    console.log(`  ✓ Found ${results.length} jobs on Indeed`);
    results.forEach(j => jobs.push({ ...j, source: 'Indeed India' }));

  } catch (err) {
    console.error(`  ✗ Indeed Error: ${err.message}`);
  } finally {
    await browser.close();
  }
  return jobs;
}
