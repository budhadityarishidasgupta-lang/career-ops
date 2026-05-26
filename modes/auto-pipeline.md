# Mode: auto-pipeline - JD to Application Pack (No PDF)

When the user pastes a JD (text or URL) with no sub-command, run this end-to-end flow.

## Goal

Return a copy-paste-ready application pack with:

1. Comprehensive scoring/evaluation (A-G)
2. Tailored CV text (markdown, no PDF)
3. Tailored cover letter (plain text)

Always use `cv.md` as the base CV source of truth.

## Step 0 - Extract JD

If input is a URL:

1. Prefer browser rendering/snapshot for SPA job pages
2. Fallback to web fetch for static pages
3. Last resort: web search

If extraction fails, ask user to paste JD text.

If input is already JD text, use it directly.

## Step 1 - Run full A-G evaluation

Execute the same A-G analysis logic as `modes/oferta.md`, including posting legitimacy.

## Step 2 - Build tailored CV text (no PDF)

Generate a JD-specific CV in markdown using only truthful content from `cv.md`.

Required sections:

- Target role headline
- Professional summary (JD keyword aligned)
- Core skills/competencies aligned to JD
- Experience bullets reordered/reworded for JD relevance
- Education and certifications

Rules:

- No invented experience, metrics, tools, or responsibilities
- Use JD terminology only when supported by `cv.md`
- Optimize for ATS readability (clean headings, concise bullets)

## Step 3 - Build tailored cover letter

Generate a role/company-specific cover letter using:

- JD requirements
- company profile context provided by user
- evidence from `cv.md`

Rules:

- Confident, specific, concise
- No generic fluff
- No fabricated claims

## Step 4 - Save report and update tracker

Save evaluation report to:

`reports/{###}-{company-slug}-{YYYY-MM-DD}.md`

Update `data/applications.md`:

- Set evaluation score
- Mark report link
- Mark PDF as not generated for this flow

## Final response format (strict)

Return exactly these top-level sections in this order:

## 1) Comprehensive Scoring

A-G summary with final score and key risks/mitigations.

## 2) Customized CV (Copy-Paste)

Full tailored CV markdown.

## 3) Customized Cover Letter (Copy-Paste)

Final cover letter text.
