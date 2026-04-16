import { chromium } from 'playwright';

/**
 * Naukri Direct Scraper
 * Bypasses brittle Google search by visiting Naukri search results directly.
 */
export async function scrapeNaukri(keywords, location = 'India') {
  console.log(`\n🇮🇳 Naukri Direct Scraper — ${keywords} in ${location}`);
  const jobs = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    // Transform keywords for slug: "software engineer" -> "software-engineer"
    const kwSlug = keywords.toLowerCase().replace(/\s+/g, '-');
    const locSlug = location.toLowerCase().replace(/\s+/g, '-');
    
    // Pattern: https://www.naukri.com/software-engineer-jobs-in-india
    const searchUrl = `https://www.naukri.com/${kwSlug}-jobs-in-${locSlug}`;
    console.log(`  🌐 Navigating to: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for the job listing container
    await page.waitForSelector('.list', { timeout: 15000 }).catch(() => null);

    // Extract jobs from the DOM
    const results = await page.evaluate(() => {
      // Naukri's common job card selector
      const cards = Array.from(document.querySelectorAll('.cust-job-tuple, .srp-jobtuple-container, article.jobTuple'));
      return cards.map(card => {
        const titleEl = card.querySelector('.title, a.title');
        const companyEl = card.querySelector('.comp-name, .companyName');
        const linkEl = card.querySelector('a.title');
        
        if (titleEl && companyEl && linkEl) {
          return {
            title: titleEl.innerText.trim(),
            company: companyEl.innerText.trim(),
            url: linkEl.href
          };
        }
        return null;
      }).filter(Boolean);
    });

    console.log(`  ✓ Found ${results.length} jobs on Naukri`);
    results.forEach(j => jobs.push({ ...j, source: 'Naukri Direct' }));

  } catch (err) {
    console.error(`  ✗ Naukri Error: ${err.message}`);
  } finally {
    await browser.close();
  }
  return jobs;
}
