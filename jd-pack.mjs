#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync } from 'fs';

function requiredEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main() {
  const apiKey = requiredEnv('OPENAI_API_KEY');
  const jdText = requiredEnv('JD_TEXT');
  const companyProfile = process.env.COMPANY_PROFILE || '';
  const model = process.env.OPENAI_MODEL || 'gpt-4.1';
  const outputPath = process.env.OUTPUT_PATH || 'out/application-pack.md';

  const cv = readFileSync('cv.md', 'utf-8');

  const systemPrompt = [
    'You are an expert job application strategist.',
    'Use cv.md as canonical truth. Never invent claims, metrics, tools, dates, or responsibilities.',
    'Return markdown only with exactly these sections in order:',
    '## 1) Comprehensive Scoring',
    '## 2) Customized CV (Copy-Paste)',
    '## 3) Customized Cover Letter (Copy-Paste)',
    'For scoring, provide A-G style summary and final score out of 5 with risks and mitigations.',
    'For CV, produce ATS-friendly markdown with role-aligned summary, skills, and tailored experience bullets.',
    'For cover letter, keep concise, role-specific, and company-specific.',
  ].join('\n');

  const userPrompt = [
    'Base CV (canonical source):',
    cv,
    '',
    'Job Description:',
    jdText,
    '',
    'Company Profile:',
    companyProfile || '(not provided)',
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        { role: 'system', content: [{ type: 'input_text', text: systemPrompt }] },
        { role: 'user', content: [{ type: 'input_text', text: userPrompt }] },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const json = await response.json();
  const output = json.output_text || '';
  if (!output.trim()) {
    throw new Error('Model returned empty output_text.');
  }

  mkdirSync('out', { recursive: true });
  writeFileSync(outputPath, output, 'utf-8');
  console.log(`Wrote ${outputPath}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

