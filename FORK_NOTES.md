# Fork Notes: joegarvey7/career-ops

This is a fork of [santifer/career-ops](https://github.com/santifer/career-ops) with additional automation for sourcing, scoring, and syncing job pipeline data.

## What changed from upstream

### New: Custom scraper pipeline (`scrapers/` + `scan-all.mjs`)

The upstream repo relies on Claude Code's WebSearch and Playwright (via the LLM agent) for portal scanning. This fork adds deterministic Node.js scrapers that run without LLM inference:

| Scraper | Method | Notes |
|---------|--------|-------|
| `scrapers/greenhouse-agg.mjs` | Greenhouse public API | Scans 55+ boards in parallel. Pure fetch, no browser. |
| `scrapers/lever-agg.mjs` | Lever public API | Scans 43+ boards. Same pattern. |
| `scrapers/linkedin.mjs` | JSearch RapidAPI | Aggregates LinkedIn + Indeed + Glassdoor. Free tier = 200 req/month. |
| `scrapers/indeed.mjs` | HTML fetch (degraded) | Indeed blocks server-side fetches. JSearch covers the gap. |
| `scrapers/wellfound.mjs` | Playwright route interception | Captures Wellfound's internal API responses instead of scraping DOM. Survives redesigns. Falls back to `__NEXT_DATA__` then DOM. |
| `scrapers/remote-boards.mjs` | Remotive API + WWR Playwright | Two remote-focused boards in one scraper. |
| `scrapers/lib/common.mjs` | Shared utilities | Title filtering (from portals.yml), deduplication (against scan-history + applications + pipeline), TSV output, stealth browser helpers. |

**Orchestrator:** `scan-all.mjs` runs all scrapers, applies title filters, deduplicates, writes to `data/pipeline.md` + `data/scan-history.tsv`, and produces a daily digest at `data/new_roles_YYYY-MM-DD.md`.

**Slug discovery:** `discover-ats-slugs.mjs` searches Google for Greenhouse/Lever job boards with PM/Director roles, validates slugs via API, and auto-appends new ones to the scraper files. Run monthly.

### New: Scoring and Obsidian sync

- `score-and-publish.mjs` — Scores all scraped roles against your profile (title level, domain fit, company tier) and publishes a sorted, categorized table to an Obsidian vault.
- `scan-and-sync.sh` — Runs `scan-all.mjs` then the LLM-powered `/career-ops scan`, then syncs new roles to Obsidian.
- `report-sync.sh` — Copies new evaluation reports to Obsidian, renaming to `YYYY-MM-DD_Company_Role.md`.
- `com.joegarvey.career-ops-scan.plist` — macOS launchd plist to run the scan every 3 days (gitignored — you'll need to create your own with your paths).

### New: npm scripts

| Script | Command |
|--------|---------|
| `npm run scan-all` | Run all 6 custom scrapers |
| `npm run scan:wellfound` | Run one scraper |
| `npm run scan:indeed` | |
| `npm run scan:jsearch` | JSearch API (LinkedIn+Indeed+Glassdoor) |
| `npm run scan:greenhouse` | Greenhouse aggregator |
| `npm run scan:lever` | Lever aggregator |
| `npm run scan:remote` | Remotive + WWR |
| `npm run discover-slugs` | Monthly ATS slug discovery |

### Modified: `modes/oferta.md`

Translated from Spanish to English. Updated Step 0 (archetype detection) to read archetypes from `modes/_profile.md` instead of using the six defaults in `_shared.md`. Added hard title-match gate and comp floor logic.

### Modified: `portals.yml` title filters

Replaced AI/ML engineering title filters with Product Management and Marketing Operations filters. Added engineering titles to the negative filter. Added Greenhouse API endpoints for Figma, Braze, Iterable, HubSpot, Amplitude, Mixpanel, dbt Labs.

### Unchanged

Everything else is upstream `santifer/career-ops`. The evaluation engine, PDF generation, batch processing, dashboard TUI, pipeline integrity scripts, and data contract are all untouched.

## Why these changes

The upstream scanner uses LLM inference for every scan (expensive, slow, non-deterministic). The custom scrapers run in ~30 seconds with zero API cost (except JSearch's free tier), produce deterministic results, and can run on a cron without a Claude Code session open.

The Obsidian sync exists because the author reviews pipeline data on mobile (Obsidian syncs via iCloud). The scoring script provides a quick triage layer before investing LLM tokens in full A-F evaluations.

## Upstream compatibility

This fork tracks upstream via `update-system.mjs`. System-layer files (`modes/_shared.md`, `*.mjs` scripts, `CLAUDE.md`) can be updated from upstream without overwriting user data or the custom scrapers. The data contract is respected: user data lives in `cv.md`, `config/profile.yml`, `modes/_profile.md`, and `data/`.
