#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('Missing OPENAI_API_KEY. Export it in your shell before running.');
  process.exit(1);
}

const root = process.cwd();
const jobsDir = path.join(root, 'jds');
const outRoot = path.join(root, 'output', 'app-packs');

const cv = await safeRead(path.join(root, 'cv.md'));
const profile = await safeRead(path.join(root, 'modes', '_profile.md'));
if (!cv || !profile) {
  console.error('Missing cv.md or modes/_profile.md.');
  process.exit(1);
}

await fs.mkdir(outRoot, { recursive: true });
const jobFiles = (await fs.readdir(jobsDir)).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
for (const file of jobFiles) {
  const jd = await safeRead(path.join(jobsDir, file));
  if (!jd) continue;
  const slug = slugify(file.replace(/\.(md|txt)$/i, ''));
  const outDir = path.join(outRoot, slug);
  await fs.mkdir(outDir, { recursive: true });

  const response = await callOpenAI(buildPrompt(cv, profile, jd));
  await fs.writeFile(path.join(outDir, 'application-pack.txt'), response, 'utf8');
  console.log(`Wrote ${path.join('output/app-packs', slug, 'application-pack.txt')}`);
}

function buildPrompt(cv, profile, jd) {
  return `You are generating a response-only application pack.\n\nRules:\n- Use cv.md as source of truth.\n- Do not invent employers, titles, dates, metrics, certifications, or language fluency.\n- Keep claims defensible and concise.\n- Output plain text CV formatting (no markdown symbols).\n\nReturn sections:\nA. Apply/Maybe/Skip + fit score\nB. Hard filters and risks\nC. Final upload-ready CV (Word-ready)\nD. Tailored cover letter\nE. Five STAR stories\nF. 30-60-90 talking points\nG. LinkedIn invite under 300 chars\nH. Tracker preview only\n\n===== cv.md =====\n${cv}\n\n===== modes/_profile.md =====\n${profile}\n\n===== JD =====\n${jd}`;
}

async function callOpenAI(prompt) {
  const body = {
    model: process.env.OPENAI_MODEL || 'gpt-5.3-codex',
    input: prompt
  };
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  return json.output_text || JSON.stringify(json, null, 2);
}

async function safeRead(p) {
  try { return await fs.readFile(p, 'utf8'); } catch { return null; }
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
