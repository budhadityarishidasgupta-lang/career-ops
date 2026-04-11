#!/usr/bin/env node
// score-and-publish.mjs — Score scraped roles against Joe's profile and publish to Obsidian
//
// Scoring dimensions (title-level triage, not full JD evaluation):
//   1. Title level (Director/Head/VP = top, Principal/Staff = strong, Senior PM = weak, PM II = skip)
//   2. Domain fit (AI/ML, Data, MarTech, DevTools = strong match)
//   3. Company tier (from config/profile.yml tiers 1-3)
//   4. Remote signal (from title/source)
//
// Output: Obsidian Career_Ops_Scanner.md with scored + sorted table

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = import.meta.dirname;
const OBSIDIAN_FILE = join(
  '/Users/josephgarvey/Library/Mobile Documents/iCloud~md~obsidian/Documents',
  '02 Personal Projects/Career Collateral/Career_Ops_Scanner.md'
);

// ── Company tiers from profile.yml ──
const TIER_1 = ['anthropic', 'snowflake', 'databricks', 'dbt labs', 'stripe'];
const TIER_2 = ['notion', 'figma', 'braze', 'iterable', 'segment', 'twilio', 'hubspot',
  'amplitude', 'mixpanel', 'glean', 'retool'];
const TIER_3 = ['adobe', 'salesforce', 'medallia', 'qualtrics', 'scale ai', 'weights & biases',
  'weights and biases', 'langfuse'];
// Strong companies not in Joe's explicit tiers but known good PM orgs
const STRONG_COMPANIES = ['datadog', 'asana', 'postman', 'klaviyo', 'fivetran', 'pagerduty',
  'launchdarkly', 'newrelic', 'new relic', 'dropbox', 'reddit', 'confluent', 'clickup',
  'gitlab', 'digitalocean', 'okta', 'lattice', 'domino data lab', 'instacart', 'affirm',
  'mercury', 'descript', 'bloomreach', 'attentive', 'socure', 'geico', 'workday', 'autodesk',
  'pagerduty', 'merck', 'axon'];

function getCompanyTier(company) {
  const c = company.toLowerCase();
  if (TIER_1.some(t => c.includes(t))) return { tier: 1, label: '🏆 Tier 1' };
  if (TIER_2.some(t => c.includes(t))) return { tier: 2, label: '⭐ Tier 2' };
  if (TIER_3.some(t => c.includes(t))) return { tier: 3, label: '🔷 Tier 3' };
  if (STRONG_COMPANIES.some(t => c.includes(t))) return { tier: 2.5, label: '💼 Strong' };
  return { tier: 4, label: '' };
}

// ── Title level scoring ──
function getTitleScore(title) {
  const t = title.toLowerCase();

  // SKIP: too junior or wrong function
  if (t.includes('associate') || t.includes('part-time') || t.includes('intern') ||
      t.includes('instructor') || t.includes('auditor') || t.includes('contractor') ||
      t.includes('independent')) {
    return { score: 0, level: 'SKIP', reason: 'Too junior / wrong type' };
  }

  // PM II = too junior for Joe
  if (t.match(/product manager ii\b/) || t.match(/^product manager[,\s]/) ||
      (t.match(/^product manager$/) && !t.includes('director') && !t.includes('principal'))) {
    return { score: 1, level: 'PM', reason: 'Mid-level PM — below Director/Principal' };
  }

  // Director / Head / VP / Senior Director = top tier
  if (t.includes('director') || t.includes('head of') || t.match(/\bvp\b/) ||
      t.includes('vice president')) {
    return { score: 5, level: 'Director+', reason: 'Director/Head/VP level' };
  }

  // Principal = strong
  if (t.includes('principal')) {
    return { score: 4.5, level: 'Principal', reason: 'Principal IC' };
  }

  // Group PM = strong (manages PMs)
  if (t.includes('group product manager')) {
    return { score: 4, level: 'Group PM', reason: 'Manages PMs' };
  }

  // Staff = solid
  if (t.includes('staff')) {
    return { score: 3.5, level: 'Staff', reason: 'Staff PM — strong IC but below Principal' };
  }

  // Senior Lead / Lead = decent
  if (t.includes('senior lead') || t.includes('lead product manager')) {
    return { score: 3, level: 'Lead', reason: 'Lead PM' };
  }

  // Senior Manager (marketing ops) = good
  if (t.includes('senior manager') || t.includes('senior group manager')) {
    return { score: 4, level: 'Sr Manager', reason: 'Senior Manager level' };
  }

  // Senior PM = likely below Joe's level
  if (t.includes('senior product manager') || t.includes('senior pm') || t.match(/^sr\.?\s/)) {
    return { score: 2, level: 'Senior PM', reason: 'Senior PM — likely below Director target' };
  }

  // Marketing Ops with Director/Head/Lead
  if ((t.includes('marketing operations') || t.includes('marketing technology') || t.includes('martech')) &&
      (t.includes('director') || t.includes('head') || t.includes('lead') || t.includes('senior manager'))) {
    return { score: 4, level: 'MktOps Lead', reason: 'Marketing Ops leadership' };
  }

  // Marketing Ops manager level
  if (t.includes('marketing operations') || t.includes('martech')) {
    return { score: 2.5, level: 'MktOps', reason: 'Marketing Ops — check level' };
  }

  // Default: mid-level PM
  return { score: 1.5, level: 'PM', reason: 'Mid-level / unclear seniority' };
}

// ── Domain fit scoring ──
function getDomainScore(title, company) {
  const t = (title + ' ' + company).toLowerCase();
  let score = 0;
  const signals = [];

  // Strong domain matches (Joe's sweet spots)
  if (t.match(/\bai\b/) || t.includes('machine learning') || t.includes('ml') ||
      t.includes('llm') || t.includes('agentic') || t.includes('genai')) {
    score += 2; signals.push('AI/ML');
  }
  if (t.includes('data') || t.includes('analytics') || t.includes('observability') ||
      t.includes('monitoring') || t.includes('telemetry')) {
    score += 1.5; signals.push('Data/Analytics');
  }
  if (t.includes('platform') || t.includes('developer') || t.includes('api') ||
      t.includes('ecosystem') || t.includes('integration')) {
    score += 1.5; signals.push('Platform/DevTools');
  }
  if (t.includes('marketing') || t.includes('martech') || t.includes('attribution') ||
      t.includes('segmentation')) {
    score += 1.5; signals.push('MarTech');
  }
  if (t.includes('enterprise')) {
    score += 1; signals.push('Enterprise');
  }

  // Weak domain matches
  if (t.includes('security') || t.includes('compliance') || t.includes('identity')) {
    score += 0.5; signals.push('Security');
  }

  // Domain mismatches (not bad, just not Joe's core)
  if (t.includes('ecommerce') || t.includes('payments') || t.includes('fintech') ||
      t.includes('billing') || t.includes('financial') || t.includes('cards')) {
    score -= 0.5; signals.push('FinTech (weak fit)');
  }
  if (t.includes('mobile') || t.includes('consumer') || t.includes('gaming') ||
      t.includes('health') || t.includes('medtech') || t.includes('aerospace')) {
    score -= 1; signals.push('Consumer/Other (weak fit)');
  }

  return { score: Math.max(0, Math.min(3, score)), signals };
}

// ── Extract company from WWR URL ──
function extractCompanyFromUrl(url) {
  // Pattern: /remote-jobs/{company-slug}-{role-slug}
  const m = url.match(/weworkremotely\.com\/remote-jobs\/([a-z0-9-]+?)-(director|head|principal|senior|staff|lead|group|product|vp|associate|manager)/i);
  if (m) {
    return m[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      .replace(/\bUsa\b/, 'USA').replace(/\bAi\b/, 'AI').replace(/\bPlg\b/, 'PLG');
  }
  // Fallback: first segment after /remote-jobs/
  const m2 = url.match(/remote-jobs\/([a-z0-9]+(?:-[a-z0-9]+)?)/i);
  if (m2) return m2[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return '';
}

// ── Main ──

// Read digest
const digestPath = join(ROOT, 'data', 'new_roles_2026-04-10.md');
const digest = readFileSync(digestPath, 'utf8');

// Also read the original pipeline from April 8 scan
const pipelinePath = join(ROOT, 'data', 'pipeline.md');
const pipeline = existsSync(pipelinePath) ? readFileSync(pipelinePath, 'utf8') : '';

// Parse digest table rows
const rows = [];
for (const line of digest.split('\n')) {
  const m = line.match(/^\|\s*(\d+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*\[View\]\((.*?)\)\s*\|/);
  if (m) {
    let company = m[2].trim();
    const title = m[3].trim();
    const source = m[4].trim();
    const url = m[5].trim();

    // Fix missing company names from WWR
    if (!company && url.includes('weworkremotely.com')) {
      company = extractCompanyFromUrl(url);
    }

    rows.push({ company, title, source, url });
  }
}

// Also parse original pipeline entries (first 16 from April 8)
for (const line of pipeline.split('\n')) {
  const m = line.match(/^- \[.\]\s*(https?:\/\/\S+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*$/);
  if (m) {
    const url = m[1].trim();
    const company = m[2].trim();
    const title = m[3].trim();
    // Only add if not already in digest
    if (!rows.some(r => r.url === url)) {
      rows.push({ company, title, source: 'portals.yml', url });
    }
  }
}

// Score each role
const scored = rows.map(r => {
  const titleInfo = getTitleScore(r.title);
  const domainInfo = getDomainScore(r.title, r.company);
  const companyInfo = getCompanyTier(r.company);

  // Composite score: weighted average
  // Title level (40%) + Domain fit (30%) + Company tier (30%)
  let titleNorm = titleInfo.score; // 0-5
  let domainNorm = domainInfo.score * (5 / 3); // 0-3 → 0-5
  let companyNorm = companyInfo.tier <= 1 ? 5 : companyInfo.tier <= 2 ? 4 : companyInfo.tier <= 2.5 ? 3.5 : companyInfo.tier <= 3 ? 3 : 2;

  let composite = (titleNorm * 0.4 + domainNorm * 0.4 + companyNorm * 0.2);

  // Hard gates from _profile.md
  if (titleInfo.score === 0) composite = 0; // SKIP

  // Cap: Senior PM at unknown company = max 2.5
  if (titleInfo.level === 'Senior PM' && companyInfo.tier >= 4) {
    composite = Math.min(composite, 2.0);
  }

  // Boost: Director+ at tier 1/2 = minimum 4.0
  if (titleInfo.score >= 5 && companyInfo.tier <= 2) {
    composite = Math.max(composite, 4.0);
  }

  // Boost: Principal at tier 1/2 or strong company = minimum 3.5
  if (titleInfo.score >= 4.5 && companyInfo.tier <= 2.5) {
    composite = Math.max(composite, 3.5);
  }

  const recommendation =
    composite === 0 ? 'SKIP' :
    composite >= 4.0 ? '🟢 APPLY' :
    composite >= 3.0 ? '🟡 REVIEW' :
    composite >= 2.0 ? '🟠 WEAK' :
    '⚪ SKIP';

  return {
    ...r,
    score: Math.round(composite * 10) / 10,
    recommendation,
    level: titleInfo.level,
    domain: domainInfo.signals.join(', ') || '—',
    companyLabel: companyInfo.label,
  };
});

// Sort: highest score first, then by company tier
scored.sort((a, b) => b.score - a.score || a.company.localeCompare(b.company));

// ── Build Obsidian table ──
const today = new Date().toISOString().slice(0, 10);

let md = `# Career Ops Scanner — Scored Pipeline\n\n`;
md += `> Last updated: ${today} | ${scored.length} roles scored | `;
md += `${scored.filter(r => r.recommendation === '🟢 APPLY').length} recommended | `;
md += `${scored.filter(r => r.recommendation === '🟡 REVIEW').length} to review\n\n`;
md += `## Scoring Guide\n`;
md += `- 🟢 **APPLY** (4.0+): Strong title + domain + company match. Prioritize.\n`;
md += `- 🟡 **REVIEW** (3.0-3.9): Good potential, needs JD review for fit.\n`;
md += `- 🟠 **WEAK** (2.0-2.9): Level or domain mismatch. Only pursue with specific reason.\n`;
md += `- ⚪ **SKIP** (<2.0): Too junior, wrong function, or hard mismatch.\n\n`;

// Top recommendations first
md += `## 🟢 Top Matches (APPLY)\n\n`;
md += `| Score | Company | Role | Level | Domain | Link | Status |\n`;
md += `|-------|---------|------|-------|--------|------|--------|\n`;
for (const r of scored.filter(r => r.recommendation === '🟢 APPLY')) {
  md += `| ${r.score} ${r.companyLabel} | ${r.company} | ${r.title} | ${r.level} | ${r.domain} | [View](${r.url}) | 🔲 New |\n`;
}

md += `\n## 🟡 Worth Reviewing\n\n`;
md += `| Score | Company | Role | Level | Domain | Link | Status |\n`;
md += `|-------|---------|------|-------|--------|------|--------|\n`;
for (const r of scored.filter(r => r.recommendation === '🟡 REVIEW')) {
  md += `| ${r.score} ${r.companyLabel} | ${r.company} | ${r.title} | ${r.level} | ${r.domain} | [View](${r.url}) | 🔲 New |\n`;
}

md += `\n## 🟠 Weak Fit\n\n`;
md += `<details><summary>${scored.filter(r => r.recommendation === '🟠 WEAK').length} roles (click to expand)</summary>\n\n`;
md += `| Score | Company | Role | Level | Domain | Link |\n`;
md += `|-------|---------|------|-------|--------|------|\n`;
for (const r of scored.filter(r => r.recommendation === '🟠 WEAK')) {
  md += `| ${r.score} | ${r.company} | ${r.title} | ${r.level} | ${r.domain} | [View](${r.url}) |\n`;
}
md += `\n</details>\n`;

md += `\n## ⚪ Skipped\n\n`;
md += `<details><summary>${scored.filter(r => r.recommendation === '⚪ SKIP' || r.recommendation === 'SKIP').length} roles (click to expand)</summary>\n\n`;
md += `| Score | Company | Role | Reason |\n`;
md += `|-------|---------|------|--------|\n`;
for (const r of scored.filter(r => r.recommendation === '⚪ SKIP' || r.recommendation === 'SKIP')) {
  md += `| ${r.score} | ${r.company} | ${r.title} | ${r.level} |\n`;
}
md += `\n</details>\n`;

// Write to Obsidian
writeFileSync(OBSIDIAN_FILE, md);
console.log(`\nPublished to Obsidian: ${OBSIDIAN_FILE}`);
console.log(`\n━━━ Score Summary ━━━`);
console.log(`Total roles:    ${scored.length}`);
console.log(`🟢 APPLY:       ${scored.filter(r => r.recommendation === '🟢 APPLY').length}`);
console.log(`🟡 REVIEW:      ${scored.filter(r => r.recommendation === '🟡 REVIEW').length}`);
console.log(`🟠 WEAK:        ${scored.filter(r => r.recommendation === '🟠 WEAK').length}`);
console.log(`⚪ SKIP:        ${scored.filter(r => r.recommendation === '⚪ SKIP' || r.recommendation === 'SKIP').length}`);

// Print top 10
console.log(`\nTop 10:`);
for (const r of scored.slice(0, 10)) {
  console.log(`  ${r.score} ${r.recommendation.padEnd(10)} ${r.company.padEnd(20)} ${r.title}`);
}
