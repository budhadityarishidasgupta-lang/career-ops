#!/usr/bin/env node
// score-and-publish.mjs — Incremental scoring + Obsidian publishing
//
// On each run:
//   1. Reads existing Obsidian table (preserves user-edited Status, Added timestamps)
//   2. Finds the latest daily digest OR reads all pipeline data
//   3. Scores ONLY new roles not already in Obsidian (dedup by URL)
//   4. Re-scores existing OPEN roles (🔲 New, 👀 Reviewing) in case scoring logic changed
//   5. Preserves rows where user set status (✅ Applied, ❌ Closed, ⏸️ Paused, 🚫 Rejected)
//   6. Writes back with Added timestamp column
//
// Table columns: Score | Company | Role | Level | Domain | Link | Status | Added
//
// Usage:
//   node score-and-publish.mjs            # Incremental (default)
//   node score-and-publish.mjs --full     # Re-score everything from pipeline + all digests

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = import.meta.dirname;
const OBSIDIAN_FILE = join(
  '/Users/josephgarvey/Library/Mobile Documents/iCloud~md~obsidian/Documents',
  '02 Personal Projects/Career Collateral/Career_Ops_Scanner.md'
);

const NOW = new Date();
const TODAY = NOW.toISOString().slice(0, 10);
const TIMESTAMP = NOW.toISOString().slice(0, 16).replace('T', ' ');
const FULL_MODE = process.argv.includes('--full');

// ── Statuses that mean "user took action — don't re-score or remove" ──
const LOCKED_STATUSES = ['✅ Applied', '❌ Closed', '⏸️ Paused', '🚫 Rejected', '🎯 Interview', '🤝 Offer'];
// Statuses that mean "still open — re-score is OK"
const OPEN_STATUSES = ['🔲 New', '👀 Reviewing'];

// ── Company tiers from profile.yml ──
const TIER_1 = ['anthropic', 'snowflake', 'databricks', 'dbt labs', 'stripe'];
const TIER_2 = ['notion', 'figma', 'braze', 'iterable', 'segment', 'twilio', 'hubspot',
  'amplitude', 'mixpanel', 'glean', 'retool'];
const TIER_3 = ['adobe', 'salesforce', 'medallia', 'qualtrics', 'scale ai', 'weights & biases',
  'weights and biases', 'langfuse'];
const STRONG_COMPANIES = ['datadog', 'asana', 'postman', 'klaviyo', 'fivetran', 'pagerduty',
  'launchdarkly', 'newrelic', 'new relic', 'dropbox', 'reddit', 'confluent', 'clickup',
  'gitlab', 'digitalocean', 'okta', 'lattice', 'domino data lab', 'instacart', 'affirm',
  'mercury', 'descript', 'bloomreach', 'attentive', 'socure', 'geico', 'workday', 'autodesk',
  'pagerduty', 'merck', 'axon'];

function getCompanyTier(company) {
  const c = company.toLowerCase();
  if (TIER_1.some(t => c.includes(t))) return { tier: 1, label: '🏆 T1' };
  if (TIER_2.some(t => c.includes(t))) return { tier: 2, label: '⭐ T2' };
  if (TIER_3.some(t => c.includes(t))) return { tier: 3, label: '🔷 T3' };
  if (STRONG_COMPANIES.some(t => c.includes(t))) return { tier: 2.5, label: '💼' };
  return { tier: 4, label: '' };
}

function getTitleScore(title) {
  const t = title.toLowerCase();
  if (t.includes('associate') || t.includes('part-time') || t.includes('intern') ||
      t.includes('instructor') || t.includes('auditor') || t.includes('contractor') ||
      t.includes('independent'))
    return { score: 0, level: 'SKIP' };
  if (t.match(/product manager ii\b/) || (t.match(/^product manager[,\s]/) && !t.includes('director') && !t.includes('principal')))
    return { score: 1, level: 'PM' };
  if (t.includes('director') || t.includes('head of') || t.match(/\bvp\b/) || t.includes('vice president'))
    return { score: 5, level: 'Director+' };
  if (t.includes('principal'))
    return { score: 4.5, level: 'Principal' };
  if (t.includes('group product manager'))
    return { score: 4, level: 'Group PM' };
  if (t.includes('staff'))
    return { score: 3.5, level: 'Staff' };
  if (t.includes('senior lead') || t.includes('lead product manager'))
    return { score: 3, level: 'Lead' };
  if (t.includes('senior manager') || t.includes('senior group manager'))
    return { score: 4, level: 'Sr Manager' };
  if (t.includes('senior product manager') || t.includes('senior pm') || t.match(/^sr\.?\s/))
    return { score: 2, level: 'Senior PM' };
  if ((t.includes('marketing operations') || t.includes('martech')) &&
      (t.includes('director') || t.includes('head') || t.includes('lead') || t.includes('senior manager')))
    return { score: 4, level: 'MktOps Lead' };
  if (t.includes('marketing operations') || t.includes('martech'))
    return { score: 2.5, level: 'MktOps' };
  return { score: 1.5, level: 'PM' };
}

function getDomainScore(title, company) {
  const t = (title + ' ' + company).toLowerCase();
  let score = 0;
  const signals = [];
  if (t.match(/\bai\b/) || t.includes('machine learning') || t.includes('ml') || t.includes('llm') || t.includes('agentic') || t.includes('genai')) { score += 2; signals.push('AI/ML'); }
  if (t.includes('data') || t.includes('analytics') || t.includes('observability') || t.includes('monitoring') || t.includes('telemetry')) { score += 1.5; signals.push('Data'); }
  if (t.includes('platform') || t.includes('developer') || t.includes('api') || t.includes('ecosystem') || t.includes('integration')) { score += 1.5; signals.push('Platform'); }
  if (t.includes('marketing') || t.includes('martech') || t.includes('attribution') || t.includes('segmentation')) { score += 1.5; signals.push('MarTech'); }
  if (t.includes('enterprise')) { score += 1; signals.push('Enterprise'); }
  if (t.includes('security') || t.includes('compliance') || t.includes('identity')) { score += 0.5; signals.push('Security'); }
  if (t.includes('ecommerce') || t.includes('payments') || t.includes('fintech') || t.includes('billing') || t.includes('financial') || t.includes('cards')) { score -= 0.5; signals.push('FinTech'); }
  if (t.includes('mobile') || t.includes('consumer') || t.includes('gaming') || t.includes('health') || t.includes('medtech') || t.includes('aerospace')) { score -= 1; signals.push('Other'); }
  return { score: Math.max(0, Math.min(3, score)), signals };
}

function computeScore(title, company) {
  const titleInfo = getTitleScore(title);
  const domainInfo = getDomainScore(title, company);
  const companyInfo = getCompanyTier(company);

  let titleNorm = titleInfo.score;
  let domainNorm = domainInfo.score * (5 / 3);
  let companyNorm = companyInfo.tier <= 1 ? 5 : companyInfo.tier <= 2 ? 4 : companyInfo.tier <= 2.5 ? 3.5 : companyInfo.tier <= 3 ? 3 : 2;
  let composite = (titleNorm * 0.4 + domainNorm * 0.4 + companyNorm * 0.2);

  if (titleInfo.score === 0) composite = 0;
  if (titleInfo.level === 'Senior PM' && companyInfo.tier >= 4) composite = Math.min(composite, 2.0);
  if (titleInfo.score >= 5 && companyInfo.tier <= 2) composite = Math.max(composite, 4.0);
  if (titleInfo.score >= 4.5 && companyInfo.tier <= 2.5) composite = Math.max(composite, 3.5);

  const recommendation =
    composite === 0 ? 'SKIP' :
    composite >= 4.0 ? '🟢 APPLY' :
    composite >= 3.0 ? '🟡 REVIEW' :
    composite >= 2.0 ? '🟠 WEAK' :
    '⚪ SKIP';

  return {
    score: Math.round(composite * 10) / 10,
    recommendation,
    level: titleInfo.level,
    domain: domainInfo.signals.join(', ') || '—',
    companyLabel: companyInfo.label,
  };
}

function extractCompanyFromUrl(url) {
  const m = url.match(/weworkremotely\.com\/remote-jobs\/([a-z0-9-]+?)-(director|head|principal|senior|staff|lead|group|product|vp|associate|manager)/i);
  if (m) return m[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/\bUsa\b/, 'USA').replace(/\bAi\b/, 'AI');
  const m2 = url.match(/remote-jobs\/([a-z0-9]+(?:-[a-z0-9]+)?)/i);
  if (m2) return m2[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return '';
}

// ── Parse existing Obsidian table ──

function parseObsidianTable() {
  if (!existsSync(OBSIDIAN_FILE)) return new Map();
  const content = readFileSync(OBSIDIAN_FILE, 'utf8');
  const existing = new Map(); // keyed by URL

  for (const line of content.split('\n')) {
    // Extract URL from any table row containing [View](URL)
    const urlMatch = line.match(/\[View\]\(([^)]+)\)/);
    if (!urlMatch || !line.startsWith('|')) continue;

    const url = urlMatch[1].trim();
    const cols = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length < 5) continue;

    // Detect format by column count:
    //   8 cols: Score | Company | Role | Level | Domain | Link | Status | Added
    //   7 cols: Score | Company | Role | Level | Domain | Link | Added (no status — collapsed sections)
    //   6 cols: Score | Company | Role | Status | Link | Added (actioned section)
    let status = '🔲 New';
    let added = '';

    if (cols.length >= 8) {
      status = cols[6] || '🔲 New';
      added = cols[7] || '';
    } else if (cols.length >= 7) {
      // Check if col 6 looks like a timestamp or a status
      if (cols[6].match(/^\d{4}-\d{2}-\d{2}/)) {
        added = cols[6];
      } else {
        status = cols[6];
      }
    }

    // Clean status — strip any [View](...) remnants from column parsing
    status = status.replace(/\[View\].*/, '').trim() || '🔲 New';
    added = added.replace(/\[View\].*/, '').trim();

    existing.set(url, {
      score: cols[0] || '',
      company: cols[1] || '',
      role: cols[2] || '',
      level: cols[3] || '',
      domain: cols[4] || '',
      url,
      status,
      added,
    });
  }
  return existing;
}

// ── Gather all candidate roles from data sources ──

function gatherNewRoles() {
  const roles = new Map(); // keyed by URL

  // Read ALL digests (or just the latest)
  const dataDir = join(ROOT, 'data');
  if (existsSync(dataDir)) {
    const digestFiles = readdirSync(dataDir)
      .filter(f => f.match(/^new_roles_\d{4}-\d{2}-\d{2}\.md$/))
      .sort()
      .reverse(); // newest first

    const filesToRead = FULL_MODE ? digestFiles : digestFiles.slice(0, 1);

    for (const file of filesToRead) {
      const content = readFileSync(join(dataDir, file), 'utf8');
      for (const line of content.split('\n')) {
        const m = line.match(/^\|\s*\d+\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*\[View\]\((.*?)\)\s*\|/);
        if (!m) continue;
        let company = m[1].trim();
        const title = m[2].trim();
        const url = m[4].trim();
        if (!company && url.includes('weworkremotely.com')) company = extractCompanyFromUrl(url);
        if (url && !roles.has(url)) roles.set(url, { company, title, url });
      }
    }
  }

  // Also read pipeline.md for anything not in a digest
  const pipelinePath = join(ROOT, 'data', 'pipeline.md');
  if (existsSync(pipelinePath)) {
    for (const line of readFileSync(pipelinePath, 'utf8').split('\n')) {
      const m = line.match(/^- \[.\]\s*(https?:\/\/\S+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*$/);
      if (m) {
        const url = m[1].trim();
        if (!roles.has(url)) roles.set(url, { company: m[2].trim(), title: m[3].trim(), url });
      }
    }
  }

  return roles;
}

// ── Main ──

const existingRows = parseObsidianTable();
const candidateRoles = gatherNewRoles();

const finalRows = []; // {score, company, role, level, domain, url, status, added, recommendation, companyLabel}
let newCount = 0;
let rescoredCount = 0;
let preservedCount = 0;

// Step 1: Process existing rows — re-score open ones, preserve locked ones
for (const [url, row] of existingRows) {
  const isLocked = LOCKED_STATUSES.includes(row.status);
  const isOpen = OPEN_STATUSES.includes(row.status);

  if (isLocked) {
    // Preserve as-is (user took action)
    finalRows.push({
      score: row.score,
      company: row.company,
      role: row.role,
      level: row.level,
      domain: row.domain,
      url: row.url,
      status: row.status,
      added: row.added,
      recommendation: row.status, // keep their status as-is
      companyLabel: '', // won't be used for locked rows
      _locked: true,
    });
    preservedCount++;
  } else if (isOpen || FULL_MODE) {
    // Re-score
    const scored = computeScore(row.role, row.company);
    finalRows.push({
      score: `${scored.score} ${scored.companyLabel}`.trim(),
      company: row.company,
      role: row.role,
      level: scored.level,
      domain: scored.domain,
      url: row.url,
      status: row.status, // keep their current open status
      added: row.added,
      recommendation: scored.recommendation,
      companyLabel: scored.companyLabel,
      _locked: false,
      _numericScore: scored.score,
    });
    rescoredCount++;
  } else {
    // Unknown status — preserve
    finalRows.push({
      score: row.score, company: row.company, role: row.role,
      level: row.level, domain: row.domain, url: row.url,
      status: row.status, added: row.added,
      recommendation: '🟠 WEAK', companyLabel: '', _locked: true,
    });
    preservedCount++;
  }
}

// Step 2: Add genuinely new roles (not already in Obsidian)
for (const [url, role] of candidateRoles) {
  if (existingRows.has(url)) continue; // already in table

  const scored = computeScore(role.title, role.company);
  finalRows.push({
    score: `${scored.score} ${scored.companyLabel}`.trim(),
    company: role.company,
    role: role.title,
    level: scored.level,
    domain: scored.domain,
    url: role.url,
    status: '🔲 New',
    added: TIMESTAMP,
    recommendation: scored.recommendation,
    companyLabel: scored.companyLabel,
    _locked: false,
    _numericScore: scored.score,
  });
  newCount++;
}

// Sort: locked rows stay grouped at top by status, then open rows by score desc
finalRows.sort((a, b) => {
  // Locked rows with user action go to separate sections
  if (a._locked && !b._locked) return 1;
  if (!a._locked && b._locked) return -1;
  if (a._locked && b._locked) return 0;
  return (b._numericScore || 0) - (a._numericScore || 0) || a.company.localeCompare(b.company);
});

// ── Build Obsidian markdown ──

const openRows = finalRows.filter(r => !r._locked);
const lockedRows = finalRows.filter(r => r._locked);
const applyRows = openRows.filter(r => r.recommendation === '🟢 APPLY');
const reviewRows = openRows.filter(r => r.recommendation === '🟡 REVIEW');
const weakRows = openRows.filter(r => r.recommendation === '🟠 WEAK');
const skipRows = openRows.filter(r => r.recommendation === '⚪ SKIP' || r.recommendation === 'SKIP');

let md = `# Career Ops Scanner — Scored Pipeline\n\n`;
md += `> Last updated: ${TIMESTAMP} | ${finalRows.length} total roles | `;
md += `${newCount} new this run | ${rescoredCount} re-scored | ${preservedCount} preserved\n\n`;

md += `## Status Legend\n`;
md += `| Status | Meaning | Editable? |\n`;
md += `|--------|---------|----------|\n`;
md += `| 🔲 New | Just discovered, not yet reviewed | Yes — change to any status |\n`;
md += `| 👀 Reviewing | You're looking at this one | Yes |\n`;
md += `| ✅ Applied | Application submitted | Locked — won't be re-scored |\n`;
md += `| ❌ Closed | Listing removed or you passed | Locked |\n`;
md += `| ⏸️ Paused | Waiting on something | Locked |\n`;
md += `| 🚫 Rejected | They said no | Locked |\n`;
md += `| 🎯 Interview | In interview process | Locked |\n`;
md += `| 🤝 Offer | Offer received | Locked |\n\n`;

md += `## Scoring Guide\n`;
md += `- 🟢 **APPLY** (4.0+): Strong title + domain + company match\n`;
md += `- 🟡 **REVIEW** (3.0-3.9): Good potential, needs JD review\n`;
md += `- 🟠 **WEAK** (2.0-2.9): Level or domain mismatch\n`;
md += `- ⚪ **SKIP** (<2.0): Too junior or hard mismatch\n\n`;

function writeTable(rows, includeStatus = true) {
  if (includeStatus) {
    md += `| Score | Company | Role | Level | Domain | Link | Status | Added |\n`;
    md += `|-------|---------|------|-------|--------|------|--------|-------|\n`;
    for (const r of rows) {
      md += `| ${r.score} | ${r.company} | ${r.role} | ${r.level} | ${r.domain} | [View](${r.url}) | ${r.status} | ${r.added} |\n`;
    }
  } else {
    md += `| Score | Company | Role | Level | Domain | Link | Added |\n`;
    md += `|-------|---------|------|-------|--------|------|-------|\n`;
    for (const r of rows) {
      md += `| ${r.score} | ${r.company} | ${r.role} | ${r.level} | ${r.domain} | [View](${r.url}) | ${r.added} |\n`;
    }
  }
}

if (applyRows.length > 0) {
  md += `## 🟢 Top Matches (${applyRows.length})\n\n`;
  writeTable(applyRows);
  md += '\n';
}

if (reviewRows.length > 0) {
  md += `## 🟡 Worth Reviewing (${reviewRows.length})\n\n`;
  writeTable(reviewRows);
  md += '\n';
}

if (weakRows.length > 0) {
  md += `<details><summary>🟠 Weak Fit (${weakRows.length})</summary>\n\n`;
  writeTable(weakRows, false);
  md += '\n</details>\n\n';
}

if (skipRows.length > 0) {
  md += `<details><summary>⚪ Skipped (${skipRows.length})</summary>\n\n`;
  writeTable(skipRows, false);
  md += '\n</details>\n\n';
}

if (lockedRows.length > 0) {
  md += `## 📌 Actioned (${lockedRows.length})\n\n`;
  md += `> These roles have a user-set status and are not re-scored.\n\n`;
  md += `| Score | Company | Role | Status | Link | Added |\n`;
  md += `|-------|---------|------|--------|------|-------|\n`;
  for (const r of lockedRows) {
    md += `| ${r.score} | ${r.company} | ${r.role} | ${r.status} | [View](${r.url}) | ${r.added} |\n`;
  }
  md += '\n';
}

// Write
writeFileSync(OBSIDIAN_FILE, md);

// Summary
console.log(`\n━━━ Score & Publish ━━━`);
console.log(`Mode:           ${FULL_MODE ? 'full rebuild' : 'incremental'}`);
console.log(`New roles:      ${newCount}`);
console.log(`Re-scored:      ${rescoredCount}`);
console.log(`Preserved:      ${preservedCount}`);
console.log(`Total in table: ${finalRows.length}`);
console.log(`🟢 APPLY:       ${applyRows.length}`);
console.log(`🟡 REVIEW:      ${reviewRows.length}`);
console.log(`🟠 WEAK:        ${weakRows.length}`);
console.log(`⚪ SKIP:        ${skipRows.length}`);
console.log(`📌 Actioned:    ${lockedRows.length}`);
console.log(`\nPublished to: ${OBSIDIAN_FILE}`);
