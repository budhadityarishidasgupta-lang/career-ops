import { chromium } from 'playwright';

export async function scrapeLinkedIn(keywords, location = 'India') {
  console.log(`\n👔 LinkedIn Public Scraper — ${keywords} in ${location}`);
  const jobs = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  // Randomized delay to mimic human behavior
  await new Promise(r => setTimeout(r, Math.random() * 2000 + 1000));

  try {
    // Public search URL (often bypasses login wall for first page)
    const searchUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}&f_TPR=r604800`; // last 7 days
    console.log(`  🌐 Navigating to: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for jobs to settle
    await new Promise(r => setTimeout(r, 1000));

    // Check if we hit a login wall immediately
    const isLoginWall = await page.evaluate(() => document.body.innerText.includes('Sign in to see') || !!document.querySelector('.authwall-join-form'));
    
    if (isLoginWall) {
      console.warn("  ⚠ LinkedIn hit an auth-wall. Skipping public search.");
      return [];
    }

    // Extract jobs
    const results = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.jobs-search__results-list li'));
      return cards.map(card => {
        const titleEl = card.querySelector('.base-search-card__title');
        const companyEl = card.querySelector('.base-search-card__subtitle');
        const linkEl = card.querySelector('.base-card__full-link');
        
        if (titleEl && companyEl && linkEl) {
          return {
            title: titleEl.innerText.trim(),
            company: companyEl.innerText.trim(),
            url: linkEl.href.split('?')[0]
          };
        }
        return null;
      }).filter(Boolean);
    });

    console.log(`  ✓ Found ${results.length} jobs`);
    results.forEach(j => jobs.push({ ...j, source: 'LinkedIn' }));

  } catch (err) {
    console.error(`  ✗ LinkedIn Error: ${err.message}`);
  } finally {
    await browser.close();
  }
  return jobs;
}
