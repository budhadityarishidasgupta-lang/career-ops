import { chromium } from 'playwright';

/**
 * Cutshort Scraper
 * Discovers jobs via public category/location directory pages.
 */
export async function scrapeCutshort(role = 'software-engineer', location = 'india') {
  console.log(`\n✂️ Cutshort Scraper — ${role} in ${location}`);
  const jobs = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    // Pattern: https://cutshort.io/jobs/software-engineer-jobs-in-bangalore
    // We attempt a generic fallback or specific location slugs
    const locSlug = location.toLowerCase().replace('bengaluru', 'bangalore');
    const searchUrl = `https://cutshort.io/jobs/${role}-jobs-in-${locSlug}`;
    console.log(`  🌐 Navigating to: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Extract job links from the directory list
    const results = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/job/"]'));
      return links.map(a => {
        const titleText = a.innerText.trim();
        if (titleText.length < 5) return null;
        
        // Structure is often "Job Title at Company"
        let title = titleText;
        let company = 'Unknown';
        if (titleText.includes(' at ')) {
           [title, company] = titleText.split(' at ');
        }
        
        return {
          title: title.trim(),
          company: company.trim(),
          url: a.href
        };
      }).filter(Boolean);
    });

    console.log(`  ✓ Found ${results.length} links on Cutshort`);
    results.forEach(j => jobs.push({ ...j, source: 'Cutshort' }));

  } catch (err) {
    console.error(`  ✗ Cutshort Error: ${err.message}`);
  } finally {
    await browser.close();
  }
  return jobs;
}
