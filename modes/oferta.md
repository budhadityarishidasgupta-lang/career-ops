# Mode: oferta — Full A-G Evaluation

When the candidate pastes an offer (text or URL), ALWAYS deliver all 7 blocks (A-F evaluation + G legitimacy). All output in English.

## Step 0 — Archetype Detection

**CRITICAL:** Ignore the six default archetypes in `modes/_shared.md`. Use the four archetypes defined in `modes/_profile.md`:

1. **AI/ML Product Leader** — LLM/RAG/agentic/MCP product strategy, model evals, AI roadmap, buy-vs-build
2. **Developer Platforms Product Leader** — developer experience, developer tools, data platforms, 3MM+ developer audiences
3. **MarTech / Analytics Product Leader** — MarTech stack, CDP, attribution, segmentation, marketing automation, demand gen
4. **Principal PM IC (Platform / AI / Data)** — deep product strategy without direct reports, horizontal cross-brand influence

Classify the JD into one of these four (or a hybrid of the closest two). This determines:
- Which proof points to prioritize in Block B
- How to rewrite the summary in Block E
- Which STAR stories to prepare in Block F

**Hard gate before proceeding:** If the JD is an engineering role (Software/ML/Data/Platform/Solutions Engineer, SRE, DevOps, Applied Scientist, Technical PM requiring coding), STOP evaluating and mark the offer `SKIP — title mismatch`. Joe is a strategic PM, not an engineer.

## Block A — Role Summary

Table with:
- Detected archetype (one of Joe's four, or hybrid)
- Domain (AI/ML, developer platform, MarTech/analytics, data infra)
- Function (strategy / roadmap / team lead / IC)
- Seniority (Director / Sr Director / Head / Principal IC / VP)
- Remote policy (remote / hybrid / onsite — and in which metro)
- Team size (if mentioned — does Joe manage people or is this IC?)
- TL;DR in one sentence

## Block B — CV Match

Read `cv.md`. Create a table mapping each JD requirement to exact lines in the CV.

**Framed to the archetype:**
- **AI/ML Product Leader** → lead with RAG DevAssistant (2.5–4K MAU), Close The Loop LLM feedback platform, Amazon Developer MCP Server, ML segmentation
- **Developer Platforms** → lead with 22 products / 15-person team / 13 BUs / $4M budget / 4.5MM annual visitors / 3MM+ developers / enterprise data warehouse (100+ datasets, days→minutes)
- **MarTech / Analytics** → lead with multi-touch attribution (68% of Prime Video/Music signups), Adobe Target personalization (42% CTR, 2x conversion), ML segmentation (85%/32%/47%), 15-phase marketing system integration
- **Principal PM IC** → lead with 2026 strategy (36 initiatives), 3-year roadmap and buy-vs-build across 22 products + 44 external tools, maintenance overhead 47%→31%

**Gaps** section with mitigation strategy for each. For each gap:
1. Is it a hard blocker or a nice-to-have?
2. Can Joe demonstrate adjacent experience?
3. Is there a proof point in the CV or builder portfolio (PlateMath, SpendSense, treasurehunter.show) that covers it?
4. Concrete mitigation plan (cover letter phrase, reframe, etc.)

## Block C — Level and Strategy

1. **Level detected in the JD** vs **Joe's natural level** (L7 Senior Manager / Head of Amazon Developer Technology). Flag any downlevel.
2. **"Sell senior without lying" plan:** specific phrases framed to the archetype, concrete accomplishments to highlight, how to position the 15-person horizontal team and 22-product portfolio as structural differentiators.
3. **"If they downlevel me" plan:** accept only if total comp clears $200K and there's a clear promotion path at 12 months. Do not accept a senior-PM (non-Director) role unless it's a Principal IC track.

## Block D — Comp and Demand

Use WebSearch for:
- Current salary ranges for the role (Glassdoor, Levels.fyi, Blind)
- Company's comp reputation
- Demand trend for the role

Table with data and cited sources. If no data, say so instead of inventing.

**Hard gate:** Flag if total comp is below $200K (SKIP). Cap global score at 4.0 if total comp is between $200K and $350K. No cap at or above $350K.

## Block E — Personalization Plan

| # | Section | Current | Proposed change | Why |
|---|---------|---------|-----------------|-----|
| 1 | Summary | ... | ... | ... |
| ... | ... | ... | ... | ... |

Top 5 changes to the CV + top 5 changes to LinkedIn to maximize the match.

## Block F — Interview Plan

6–10 STAR+R stories (STAR + **Reflection**) mapped to JD requirements:

| # | JD requirement | STAR+R story | S | T | A | R | Reflection |
|---|----------------|--------------|---|---|---|---|------------|

The **Reflection** column captures what was learned or what would be done differently. This signals seniority — junior candidates describe what happened, senior candidates extract lessons. Joe's CV already has seven STAR+R stories in the Career Stories section — reuse them first before inventing new ones.

**Story Bank:** If `interview-prep/story-bank.md` exists, check whether these stories are already there. If not, append new ones. Over time this builds a reusable bank of 5–10 master stories that adapt to any interview question.

**Framed to the archetype:**
- **AI/ML Product Leader** → emphasize shipping production AI, metrics, product discovery, buy-vs-build
- **Developer Platforms** → emphasize the horizontal team, cross-brand visibility, infrastructure extensibility, developer lifecycle thinking
- **MarTech / Analytics** → emphasize attribution rigor, segmentation wins, MarTech stack ownership, Marketing-Sales-Engineering alignment
- **Principal PM IC** → emphasize strategy depth, trade-offs, influence without authority, 3-year roadmap thinking

Also include:
- 1 recommended case study (which of Joe's projects to present and how — DevAssistant, MCP Server, Enterprise Data Platform, or ML Attribution are the strongest)
- Red-flag questions and how to answer them (e.g., "Why are you leaving Amazon?", "How hands-on are you with code?", "Have you owned a P&L?")

## Bloque G — Posting Legitimacy

Analyze the job posting for signals that indicate whether this is a real, active opening. This helps the user prioritize their effort on opportunities most likely to result in a hiring process.

**Ethical framing:** Present observations, not accusations. Every signal has legitimate explanations. The user decides how to weigh them.

### Signals to analyze (in order):

**1. Posting Freshness** (from Playwright snapshot, already captured in Paso 0):
- Date posted or "X days ago" -- extract from page
- Apply button state (active / closed / missing / redirects to generic page)
- If URL redirected to generic careers page, note it

**2. Description Quality** (from JD text):
- Does it name specific technologies, frameworks, tools?
- Does it mention team size, reporting structure, or org context?
- Are requirements realistic? (years of experience vs technology age)
- Is there a clear scope for the first 6-12 months?
- Is salary/compensation mentioned?
- What ratio of the JD is role-specific vs generic boilerplate?
- Any internal contradictions? (entry-level title + staff requirements, etc.)

**3. Company Hiring Signals** (2-3 WebSearch queries, combine with Block D research):
- Search: `"{company}" layoffs {year}` -- note date, scale, departments
- Search: `"{company}" hiring freeze {year}` -- note any announcements
- If layoffs found: are they in the same department as this role?

**4. Reposting Detection** (from scan-history.tsv):
- Check if company + similar role title appeared before with a different URL
- Note how many times and over what period

**5. Role Market Context** (qualitative, no additional queries):
- Is this a common role that typically fills in 4-6 weeks?
- Does the role make sense for this company's business?
- Is the seniority level one that legitimately takes longer to fill?

### Output format:

**Assessment:** One of three tiers:
- **High Confidence** -- Multiple signals suggest a real, active opening
- **Proceed with Caution** -- Mixed signals worth noting
- **Suspicious** -- Multiple ghost job indicators, investigate before investing time

**Signals table:** Each signal observed with its finding and weight (Positive / Neutral / Concerning).

**Context Notes:** Any caveats (niche role, government job, evergreen position, etc.) that explain potentially concerning signals.

### Edge case handling:
- **Government/academic postings:** Longer timelines are standard. Adjust thresholds (60-90 days is normal).
- **Evergreen/continuous hire postings:** If the JD explicitly says "ongoing" or "rolling," note it as context -- this is not a ghost job, it is a pipeline role.
- **Niche/executive roles:** Staff+, VP, Director, or highly specialized roles legitimately stay open for months. Adjust age thresholds accordingly.
- **Startup / pre-revenue:** Early-stage companies may have vague JDs because the role is genuinely undefined. Weight description vagueness less heavily.
- **No date available:** If posting age cannot be determined and no other signals are concerning, default to "Proceed with Caution" with a note that limited data was available. NEVER default to "Suspicious" without evidence.
- **Recruiter-sourced (no public posting):** Freshness signals unavailable. Note that active recruiter contact is itself a positive legitimacy signal.

---

## Post-evaluation

**ALWAYS** after generating blocks A–G:

### 1. Save report .md

Save the full evaluation to `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`.

- `{###}` = next sequential number (3 digits, zero-padded)
- `{company-slug}` = company name lowercased, hyphenated
- `{YYYY-MM-DD}` = today's date

**Report format:**

```markdown
# Evaluation: {Company} — {Role}

**Date:** {YYYY-MM-DD}
**URL:** {job posting URL}
**Archetype:** {detected — from _profile.md}
**Score:** {X.X/5}
**Legitimacy:** {High Confidence | Proceed with Caution | Suspicious}
**PDF:** {path or pending}

---

## A) Role Summary
(full content of Block A)

## B) CV Match
(full content of Block B)

## C) Level and Strategy
(full content of Block C)

## D) Comp and Demand
(full content of Block D)

## E) Personalization Plan
(full content of Block E)

## F) Interview Plan
(full content of Block F)

## G) Posting Legitimacy
(full content of Block G)

## H) Draft Application Answers
(only if score >= 4.5 — drafts for the application form)

---

## Keywords extracted
(15–20 keywords from the JD for ATS optimization)
```

### 2. Register in tracker

**ALWAYS** write a TSV to `batch/tracker-additions/{num}-{company-slug}.tsv` (NEVER edit `data/applications.md` directly to add rows). Nine tab-separated columns in this order:

```
{num}\t{date}\t{company}\t{role}\t{status}\t{score}/5\t{pdf_emoji}\t[{num}](reports/{num}-{slug}-{date}.md)\t{note}
```

- `status`: `Evaluated` (or `SKIP` if the title-match gate fails)
- `score`: format `X.X/5`
- `pdf`: ❌ (or ✅ if the auto-pipeline generated one)

Then run `node merge-tracker.mjs` to merge into `data/applications.md`.
