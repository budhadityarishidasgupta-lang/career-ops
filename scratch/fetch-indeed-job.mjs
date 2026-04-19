import { chromium } from 'playwright';
import sql from '../db/client.mjs';

const jobUrl = 'https://in.indeed.com/viewjob?jk=fe20e5da3501318e&tk=1jma8g1h9io5o800&from=jobi2a_jobmatch-reactivation-en-IN_email&rjptk=1jma8g0nmndij800&xpse=SoBm67I3kKcL5zTN6h0LbzkdCdPP&xfps=54b6f52c-0446-4e14-8bb2-322ac6b9025d&xkcb=SoAQ67M3kKZPVf73zB0JbzkdCdPP';

async function fetchAndInsert() {
  console.log('🔍 Fetching Indeed job details...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    await page.goto(jobUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('.jobsearch-JobInfoHeader-title', { timeout: 15000 }).catch(() => null);

    const title = await page.textContent('.jobsearch-JobInfoHeader-title').then(t => t?.trim()) || 'Software Engineer';
    const company = await page.textContent('div[data-company-name="true"], .jobsearch-CompanyInfoContainer').then(t => t?.trim()) || 'Unknown';
    
    console.log(`✅ Found: ${title} at ${company}`);

    const job = {
      url: jobUrl.split('&')[0], // Clean URL
      company: company,
      title: title,
      source: 'Indeed Direct'
    };

    const [inserted] = await sql`
      INSERT INTO jobs ${sql(job, 'url', 'company', 'title', 'source')}
      ON CONFLICT (url) DO UPDATE SET company = EXCLUDED.company, title = EXCLUDED.title
      RETURNING id
    `;

    console.log(`\n🚀 Job added to pipeline with ID: ${inserted.id}`);
    console.log(`Next step: npm run offer-match -- ${inserted.id}`);

  } catch (err) {
    console.error(`✗ Error: ${err.message}`);
  } finally {
    await browser.close();
    process.exit(0);
  }
}

fetchAndInsert();
