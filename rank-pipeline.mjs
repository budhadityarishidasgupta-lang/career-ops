import sql from './db/client.mjs';
import fs from 'fs';

const OUTPUT_JSON = 'data/current_eval.json';

const rawUserId = process.env.SCAN_USER_ID || 1;
const userId = Number.parseInt(String(rawUserId), 10);
if (!Number.isFinite(userId)) {
  throw new Error(`Invalid SCAN_USER_ID: ${rawUserId}`);
}

// scoring weights for ranking
const SCORES = {
  'staff': 2, 'principal': 2, 'lead': 2, 'engineer': 1.5,
  'ai': 3, 'ml': 3, 'llm': 3, 'agent': 3,
  'devops': 2.5, 'sre': 2.5, 'consultant': 2, 'architect': 2.5,
  'senior': 1, 'remote': 0.5, 'pune': 3, 'india': 2,
  'bengaluru': 2.5, 'bangalore': 2.5, 'hyderabad': 2, 'gurgaon': 2,
  'mumbai': 1.5, 'noida': 1.5,
  // Penalties for unwanted roles
  'manager': -10, 'director': -10, 'vp': -10, 'executive': -10,
  'product': -5, 'program': -5, 'hr': -10
};

function scoreJob(title, company) {
  let score = 0;
  const combined = ((title || '') + ' ' + (company || '')).toLowerCase();
  for (const [kw, val] of Object.entries(SCORES)) {
    if (combined.includes(kw)) score += val;
  }
  return parseFloat(score.toFixed(1));
}

async function run() {
  console.log("🎯 Scoring jobs in the pipeline...");

  try {
    // Optimization: Only score/rank the most recent 500 jobs to keep it fast
    const jobs = await sql`
      SELECT id, url, company, title, source FROM jobs
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 500
    `;

    console.log(`  ✓ Fetched ${jobs.length} recent jobs from database for user ${userId}.`);
    if (jobs.length === 0) {
      console.log("  ⚠ No jobs found to score. Run 'scan' first.");
      process.exit(0);
    }

    console.log("  ⚡ Scoring in progress...");
    const scoredJobs = jobs.map(j => ({
      ...j,
      score: scoreJob(j.title, j.company)
    }));

    // push scores to db (Parallelized for speed)
    console.log("  💾 Saving scores...");
    await Promise.all(scoredJobs.map(j => 
       sql`UPDATE jobs SET score = ${j.score} WHERE id = ${j.id}`
    ));
    console.log("  ✓ Database updated.");

    // Rank by score descending
    scoredJobs.sort((a, b) => b.score - a.score);

    console.log('--- Ranked Jobs ---');

    const mapping = {};
    scoredJobs.forEach((job, index) => {
      const idx = index + 1;
      mapping[idx] = { 
        id: job.id,
        url: job.url, 
        company: job.company, 
        title: job.title, 
        source: job.source || 'Scanned',
        score: job.score 
      };
      const scoreStr = job.score > 0 ? `[Score: ${job.score}]` : `[Score: 0]`;
      console.log(`${String(job.id).padStart(5)}  (rank ${String(idx).padStart(3)})  ${scoreStr.padEnd(12)} ${job.company.substring(0,18).padEnd(19)} | ${job.title}`);
    });

    console.log('-------------------');
    console.log(`Done. Scored ${scoredJobs.length} jobs.`);

    // Save mapping for backward compatibility in auto-apply index lookup
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(mapping, null, 2));

  } catch (err) {
    console.error("❌ Ranking failed:", err.message);
  } finally {
    process.exit(0);
  }
}

run();
