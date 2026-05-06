#!/usr/bin/env node

/**
 * batch-apply.mjs — Parallel batch application prep
 *
 * Takes N evaluated jobs (score >= threshold), and for each one in parallel:
 * 1. Fetches the JD
 * 2. Tailors Carol's CV for that specific role
 * 3. Generates a PDF via Playwright
 * 4. Drafts application answers (common questions)
 * 5. Saves everything to output/{num}-{company-slug}/
 *
 * Carol then reviews and manually submits each application.
 *
 * Usage:
 *   node batch-apply.mjs                    # prep all scored >= 4.0
 *   node batch-apply.mjs --min-score 3.5    # lower threshold
 *   node batch-apply.mjs --status Evaluated # only Evaluated (not already Applied)
 *   node batch-apply.mjs --nums 1,2,5       # specific application numbers
 *   node batch-apply.mjs --dry-run          # preview what would be prepped
 *   node batch-apply.mjs --concurrency 3    # max parallel workers (default: 5)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { chromium } from 'playwright';

// ── Config ──────────────────────────────────────────────────────────

const CV_PATH = 'cv.md';
const APPS_PATH = 'data/applications.md';
const TEMPLATE_PATH = 'templates/cv-template.html';
const OUTPUT_DIR = 'output';

// ── Args ────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

function getArg(flag, defaultVal) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal;
}

const minScore = parseFloat(getArg('--min-score', '4.0'));
const statusFilter = getArg('--status', 'Evaluated');
const numsArg = getArg('--nums', null);
const selectedNums = numsArg ? numsArg.split(',').map(Number) : null;
const concurrency = parseInt(getArg('--concurrency', '5'));

// ── Parse applications.md ───────────────────────────────────────────

function parseApplications() {
  if (!existsSync(APPS_PATH)) {
    console.error('Error: data/applications.md not found.');
    process.exit(1);
  }

  const lines = readFileSync(APPS_PATH, 'utf-8').split('\n');
  const apps = [];

  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    if (line.includes('---') || line.includes('Company')) continue;

    const cells = line.split('|').map(s => s.trim());
    const num = parseInt(cells[1]);
    if (isNaN(num) || num === 0) continue;

    const scoreRaw = cells[5] || '';
    const scoreMatch = scoreRaw.match(/([\d.]+)/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;

    const reportRaw = cells[8] || '';
    const reportMatch = reportRaw.match(/\]\(([^)]+)\)/);

    apps.push({
      num,
      date: cells[2],
      company: cells[3],
      role: cells[4],
      score,
      status: cells[6],
      reportPath: reportMatch ? reportMatch[1] : null,
      notes: cells[9] || '',
    });
  }

  return apps;
}

// ── Filter applications ─────────────────────────────────────────────

function filterApps(apps) {
  return apps.filter(app => {
    if (selectedNums) return selectedNums.includes(app.num);
    return app.score >= minScore && app.status === statusFilter;
  });
}

// ── Read report to extract URL ──────────────────────────────────────

function extractUrlFromReport(reportPath) {
  if (!reportPath || !existsSync(reportPath)) return null;
  const content = readFileSync(reportPath, 'utf-8');
  const match = content.match(/\*\*URL:\*\*\s*(https?:\/\/\S+)/);
  if (match) return match[1];
  // Fallback: find first https URL in the file
  const urlMatch = content.match(/https?:\/\/jobs\.[^\s)]+/);
  return urlMatch ? urlMatch[0] : null;
}

// ── Fetch JD from URL ───────────────────────────────────────────────

async function fetchJd(url) {
  if (!url) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'career-ops/1.0' },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const html = await res.text();
    // Extract text content (rough — strip HTML tags)
    return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000); // Cap at 5K chars
  } catch {
    return null;
  }
}

// ── Generate tailored CV HTML ───────────────────────────────────────

function generateCvHtml(app, cv, jdText) {
  // Read the CV and extract key sections
  const summaryMatch = cv.match(/## Professional Summary\s*\n([\s\S]*?)(?=\n---|\n##)/);
  const summary = summaryMatch ? summaryMatch[1].trim() : '';

  const expMatch = cv.match(/## Professional Experience\s*\n([\s\S]*?)(?=\n---|\n##)/);
  const experience = expMatch ? expMatch[1].trim() : '';

  const skillsMatch = cv.match(/## Technical Skills\s*\n([\s\S]*?)$/);
  const skills = skillsMatch ? skillsMatch[1].trim() : '';

  const eduMatch = cv.match(/## Education\s*\n([\s\S]*?)(?=\n---|\n##)/);
  const education = eduMatch ? eduMatch[1].trim() : '';

  // Tailor the summary to mention the company and role
  const tailoredSummary = summary
    .replace(/Software Engineer/i, `Software Engineer targeting ${app.role} opportunities`)
    + (app.company ? ` Excited to bring this experience to ${app.company}.` : '');

  // Convert markdown bullets to HTML
  function bulletsToHtml(text) {
    return text.split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => `<li>${l.replace(/^-\s*/, '').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</li>`)
      .join('\n');
  }

  // Parse experience blocks
  const expBlocks = experience.split(/\n### /).filter(Boolean).map(block => {
    const lines = block.split('\n');
    const headerLine = lines[0].replace(/^### /, '');
    const parts = headerLine.split('|').map(s => s.trim());
    const company = parts[0] || '';
    const location = parts.slice(1).join(' | ');

    const dateLine = lines.find(l => l.startsWith('**'));
    const date = dateLine ? dateLine.replace(/\*\*/g, '') : '';

    const bullets = lines.filter(l => l.trim().startsWith('-'));
    const bulletHtml = bullets
      .map(l => `<li>${l.replace(/^-\s*/, '').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</li>`)
      .join('\n');

    return { company, location, date, bulletHtml };
  });

  // Core competencies from skills section
  const skillTags = skills.match(/\*\*[^*]+\*\*:\s*([^\n]+)/g) || [];
  const allSkills = skillTags.flatMap(line => {
    const match = line.match(/\*\*[^*]+\*\*:\s*(.+)/);
    return match ? match[1].split(',').map(s => s.trim()) : [];
  }).slice(0, 12);

  const competenciesHtml = allSkills
    .map(s => `<span class="competency-tag">${s}</span>`)
    .join('\n      ');

  const experienceHtml = expBlocks.map(exp => `
    <div class="job">
      <div class="job-header">
        <span class="job-company">${exp.company}</span>
        <span class="job-period">${exp.date}</span>
      </div>
      <div class="job-role">Backend Software Engineer <span class="job-location">| ${exp.location}</span></div>
      <ul>${exp.bulletHtml}</ul>
    </div>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Carol El Souki -- CV</title>
<style>
  @font-face { font-family: 'Space Grotesk'; src: url('./fonts/space-grotesk-latin.woff2') format('woff2'); font-weight: 300 700; font-display: swap; }
  @font-face { font-family: 'DM Sans'; src: url('./fonts/dm-sans-latin.woff2') format('woff2'); font-weight: 100 1000; font-display: swap; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: 'DM Sans', sans-serif; font-size: 11px; line-height: 1.5; color: #1a1a2e; }
  .page { max-width: 800px; margin: 0 auto; padding: 2px 0; }
  .header { margin-bottom: 20px; }
  .header h1 { font-family: 'Space Grotesk', sans-serif; font-size: 28px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 6px; }
  .header-gradient { height: 2px; background: linear-gradient(to right, hsl(187, 74%, 32%), hsl(270, 70%, 45%)); margin-bottom: 10px; }
  .contact-row { display: flex; flex-wrap: wrap; gap: 8px 14px; font-size: 10.5px; color: #555; }
  .contact-row a { color: #555; text-decoration: none; }
  .separator { color: #ccc; }
  .section { margin-bottom: 18px; }
  .section-title { font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: hsl(187, 74%, 32%); border-bottom: 1.5px solid #e2e2e2; padding-bottom: 4px; margin-bottom: 10px; }
  .summary-text { font-size: 11px; line-height: 1.7; color: #2f2f2f; }
  .competencies-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .competency-tag { font-size: 10px; font-weight: 500; color: hsl(187, 74%, 28%); background: hsl(187, 40%, 95%); padding: 4px 10px; border-radius: 3px; border: 1px solid hsl(187, 40%, 88%); }
  .job { margin-bottom: 14px; break-inside: avoid; }
  .job-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
  .job-company { font-family: 'Space Grotesk', sans-serif; font-size: 12.5px; font-weight: 600; color: hsl(270, 70%, 45%); }
  .job-period { font-size: 10.5px; color: #777; }
  .job-role { font-size: 11px; font-weight: 600; color: #333; margin-bottom: 6px; }
  .job-location { font-size: 10px; color: #888; }
  .job ul { padding-left: 18px; margin-top: 6px; }
  .job li { font-size: 10.5px; line-height: 1.6; color: #333; margin-bottom: 4px; }
  .job li strong { font-weight: 600; }
  .edu-title { font-weight: 600; font-size: 11px; }
  .edu-org { color: hsl(270, 70%, 45%); font-weight: 500; }
  .edu-desc { font-size: 10px; color: #666; margin-top: 2px; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 6px 14px; }
  .skill-item { font-size: 10.5px; color: #444; }
  .skill-category { font-weight: 600; color: #333; }
  a { white-space: nowrap; }
  @media print { body { -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>Carol El Souki</h1>
    <div class="header-gradient"></div>
    <div class="contact-row">
      <span>(974) 71 85 0288</span>
      <span class="separator">|</span>
      <span>elsoukicarol@gmail.com</span>
      <span class="separator">|</span>
      <a href="https://www.linkedin.com/in/carol-el-souki-22a2a825b/">linkedin.com/in/carolelsouki</a>
      <span class="separator">|</span>
      <span>Doha, Qatar -- Open to Relocation</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Professional Summary</div>
    <div class="summary-text">${tailoredSummary}</div>
  </div>

  <div class="section">
    <div class="section-title">Core Competencies</div>
    <div class="competencies-grid">
      ${competenciesHtml}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Professional Experience</div>
    ${experienceHtml}
  </div>

  <div class="section">
    <div class="section-title">Education</div>
    <div class="edu-title">Bachelor of Science in Computer Science -- <span class="edu-org">University of Balamand</span> <span style="font-size:10px;color:#777">May 2024</span></div>
    <div class="edu-desc">Dean's List (Spring 2022) | Devathon Programming Competition -- 5th Place (2023)</div>
  </div>

  <div class="section">
    <div class="section-title">Technical Skills</div>
    <div class="skills-grid">
      <span class="skill-item"><span class="skill-category">Languages:</span> Python, JavaScript, TypeScript, Java, C++</span>
      <span class="skill-item"><span class="skill-category">Backend:</span> Django, Node.js, Express.js, REST APIs, JWT, OAuth 2.0, Redis</span>
      <span class="skill-item"><span class="skill-category">Frontend:</span> React, React Native, HTML5, CSS3</span>
      <span class="skill-item"><span class="skill-category">Cloud:</span> Azure (SDK, Blob Storage), GCP, AWS, CI/CD</span>
      <span class="skill-item"><span class="skill-category">Databases:</span> PostgreSQL, MongoDB, MySQL, Redis, Firebase</span>
      <span class="skill-item"><span class="skill-category">Spoken:</span> Spanish (Native), English (Professional), Arabic (Working)</span>
    </div>
  </div>
</div>
</body>
</html>`;
}

// ── Draft common application answers ────────────────────────────────

function draftAnswers(app, cv, jdText) {
  const answers = {
    company: app.company,
    role: app.role,
    score: app.score,

    whyCompany: `I'm drawn to ${app.company} because of the opportunity to work on ${app.role.toLowerCase().includes('backend') ? 'backend systems at scale' : 'impactful engineering challenges'}. My experience building a multi-tenant platform for 500+ users and architecting 5 Django ERP modules shows I can own end-to-end delivery. I'm excited to bring that same ownership mindset to ${app.company}.`,

    whyYou: `I bring 2+ years of hands-on backend engineering: Python/Django, Node.js, cloud platforms (Azure, AWS, GCP), and production API design. I've led a multi-tenant document platform serving 500+ users with OAuth 2.0 and RBAC, built asynchronous data pipelines processing 100+ files daily, and optimized API response times by 25% with Redis caching. I also mentor junior engineers and drive technical hiring — I own problems end to end.`,

    hardProblem: `At Autonomous Enterprise Management Systems, I built a document synchronization system between Google Drive and Azure Blob Storage for 500+ users across multiple tenants. The challenge was handling failures gracefully at scale — network timeouts, rate limits, permission conflicts. I designed an idempotent async pipeline with structured error handling (transient vs permanent failures), retry mechanisms, and real-time status tracking. The result: 100+ files daily with zero data loss. The patterns became the team standard.`,

    salary: '$3,000+/month — flexible on structure, focused on total package and growth opportunity.',

    location: 'Based in Doha, Qatar. Open to relocation (Spain preferred) and remote work. Spanish (native), English (professional), Arabic (working).',
  };

  return answers;
}

// ── Process one application ─────────────────────────────────────────

async function processApp(app, cv, browser) {
  const slug = app.company.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const dir = join(OUTPUT_DIR, `${String(app.num).padStart(3, '0')}-${slug}`);
  mkdirSync(dir, { recursive: true });

  console.log(`  [${app.num}] ${app.company} — ${app.role} (${app.score}/5)`);

  // 1. Get job URL from report
  const url = extractUrlFromReport(app.reportPath);

  // 2. Fetch JD (best effort)
  const jdText = url ? await fetchJd(url) : null;

  // 3. Generate tailored CV HTML
  const html = generateCvHtml(app, cv, jdText);
  const htmlPath = join(dir, 'cv.html');
  writeFileSync(htmlPath, html, 'utf-8');

  // 4. Generate PDF
  const pdfPath = join(dir, 'cv.pdf');
  try {
    const page = await browser.newPage();
    await page.goto(`file://${join(process.cwd(), htmlPath)}`, { waitUntil: 'networkidle' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' },
      printBackground: true,
    });
    await page.close();
    console.log(`    ✓ PDF: ${pdfPath}`);
  } catch (err) {
    console.log(`    ✗ PDF failed: ${err.message}`);
  }

  // 5. Draft answers
  const answers = draftAnswers(app, cv, jdText);
  const answersPath = join(dir, 'answers.md');
  writeFileSync(answersPath, `# Application Prep: ${app.company} — ${app.role}

**Score:** ${app.score}/5
**URL:** ${url || 'N/A'}
**Status:** Ready to apply

---

## Why ${app.company}?

${answers.whyCompany}

## Why should we hire you?

${answers.whyYou}

## Tell us about a hard problem

${answers.hardProblem}

## Salary expectations

${answers.salary}

## Location / availability

${answers.location}

---

*Files in this folder:*
- \`cv.pdf\` — Tailored CV for this role
- \`cv.html\` — Source HTML (editable)
- \`answers.md\` — This file (copy-paste into application forms)
`, 'utf-8');

  console.log(`    ✓ Answers: ${answersPath}`);

  return { num: app.num, company: app.company, role: app.role, score: app.score, dir, url };
}

// ── Parallel execution with concurrency limit ───────────────────────

async function parallelProcess(items, limit, fn) {
  const results = [];
  let i = 0;

  async function next() {
    while (i < items.length) {
      const item = items[i++];
      results.push(await fn(item));
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => next());
  await Promise.all(workers);
  return results;
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(CV_PATH)) {
    console.error('Error: cv.md not found. Run onboarding first.');
    process.exit(1);
  }

  const cv = readFileSync(CV_PATH, 'utf-8');
  const allApps = parseApplications();
  const targetApps = filterApps(allApps);

  if (targetApps.length === 0) {
    console.log(`No applications match the criteria (score >= ${minScore}, status = "${statusFilter}").`);
    console.log(`Current applications:`);
    for (const a of allApps) {
      console.log(`  #${a.num} ${a.company} — ${a.role} | ${a.score}/5 | ${a.status}`);
    }
    process.exit(0);
  }

  console.log(`\nBatch Apply Prep — ${targetApps.length} jobs`);
  console.log(`${'━'.repeat(45)}`);
  console.log(`Min score: ${minScore} | Status: ${statusFilter} | Concurrency: ${concurrency}`);
  if (dryRun) console.log('(dry run — no files will be written)\n');

  for (const app of targetApps) {
    console.log(`  #${app.num} ${app.company} — ${app.role} (${app.score}/5)`);
  }

  if (dryRun) {
    console.log(`\nWould generate ${targetApps.length} tailored CVs + answer drafts.`);
    process.exit(0);
  }

  console.log(`\nGenerating tailored CVs and answer drafts...\n`);

  // Launch browser for PDF generation
  const browser = await chromium.launch({ headless: true });

  const results = await parallelProcess(targetApps, concurrency, (app) =>
    processApp(app, cv, browser)
  );

  await browser.close();

  // Notify dashboard
  try {
    await fetch('http://localhost:3000/api/sync/import', { method: 'POST' });
  } catch { /* dashboard not running */ }

  // Summary
  console.log(`\n${'━'.repeat(45)}`);
  console.log(`Batch Apply Prep — Complete`);
  console.log(`${'━'.repeat(45)}`);
  console.log(`\n| # | Company | Role | Score | Folder |`);
  console.log(`|---|---------|------|-------|--------|`);
  for (const r of results) {
    console.log(`| ${r.num} | ${r.company} | ${r.role} | ${r.score}/5 | ${r.dir} |`);
  }
  console.log(`\nEach folder contains:`);
  console.log(`  - cv.pdf    → Tailored CV ready to upload`);
  console.log(`  - answers.md → Draft answers ready to copy-paste`);
  console.log(`\n→ Open each job URL, upload the PDF, paste the answers, and submit.`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
