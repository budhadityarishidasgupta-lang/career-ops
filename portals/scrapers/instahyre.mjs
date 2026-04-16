import { chromium } from 'playwright';

export async function scrapeInstahyre(keywords, locations = ['Pune', 'Bengaluru']) {
  console.log(`\n🏢 Instahyre Scraper — ${keywords} in ${locations.join(', ')}`);
  const jobs = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    for (const loc of locations) {
      const searchUrl = `https://www.instahyre.com/search-jobs?keywords=${encodeURIComponent(keywords)}&locations=${encodeURIComponent(loc)}`;
      console.log(`  🌐 Navigating to: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for job cards to appear with realistic timing
      await page.waitForSelector('.job-listing-container', { timeout: 15000 }).catch(() => null);
      await new Promise(r => setTimeout(r, 1000));

      const results = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.job-listing-container'));
        return cards.map(card => {
          const titleEl = card.querySelector('.job-title');
          const companyEl = card.querySelector('.company-name');
          const linkEl = card.querySelector('a[id^="view-job"]');
          
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

      console.log(`  ✓ Found ${results.length} jobs in ${loc}`);
      results.forEach(j => jobs.push({ ...j, source: 'Instahyre' }));
    }
  } catch (err) {
    console.error(`  ✗ Instahyre Error: ${err.message}`);
  } finally {
    await browser.close();
  }
  return jobs;
}
