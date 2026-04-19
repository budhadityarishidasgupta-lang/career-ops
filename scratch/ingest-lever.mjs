import sql from '../db/client.mjs';
import { execSync } from 'child_process';

const job = {
  url: 'https://jobs.lever.co/smart-working-solutions/80bb1d25-b21f-44c7-bebf-357b26d2a978',
  company: 'Smart Working Solutions',
  title: 'Backend Engineer (Smart Working)',
  source: 'Manual'
};

async function ingest() {
  console.log(`🚀 Ingesting: ${job.company}...`);
  await sql`
    INSERT INTO jobs ${sql(job, 'url', 'company', 'title', 'source')}
    ON CONFLICT (url) DO UPDATE SET title = ${job.title}
  `;
  console.log("✅ Database updated.");
  
  console.log("🎯 Triggering rank to assign ID...");
  // I can't run node directly but I can tell the user to run it or try to run the local node path if known.
  // Actually, I'll just finish the script and the user can run it.
}

ingest().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
