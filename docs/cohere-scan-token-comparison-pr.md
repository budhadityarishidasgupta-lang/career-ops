## What does this PR do?

Documents a dry-run comparison of `/career-ops scan` for Cohere in two scan modes:

- Playwright-rendered scraping of the Cohere Ashby board.
- `scan.mjs --dry-run --company Cohere` using the configured Cohere `local_parser`.

The comparison is intended to show the token tradeoff between an agent reading a rendered careers page and the zero-token local parser path.

## Related issue

N/A - measurement and documentation artifact.

## Type of change

- [ ] Bug fix
- [ ] New feature
- [x] Documentation / translation
- [ ] Refactor (no behavior change)

## Summary

The local parser path is the cheaper search path for Cohere because it runs locally through `scan.mjs` and does not send scraped job data to an LLM. In this test, the local parser found 71 Cohere Engineering/R&D jobs, then the scanner filtered and deduplicated them down to 33 dry-run new offers.

The Playwright path rendered `https://jobs.ashbyhq.com/cohere` in Chromium and extracted the page text/job links from the live careers board. That path found 129 unique job URLs across the whole board.

These counts are not perfectly apples-to-apples: the Playwright scrape read the full Cohere board, while the local parser is intentionally scoped to Engineering/R&D departments.

## Token Comparison

| Mode | Test command / method | Jobs found | LLM tokens used by search | Token estimate basis |
|---|---|---:|---:|---|
| Playwright scrape | Headless Chromium render of `https://jobs.ashbyhq.com/cohere` | 129 unique job URLs | Not directly exposed by Cursor | Rendered page body was 17,526 characters, roughly 4,382 estimated payload tokens using `characters / 4` |
| Local parser | `node scan.mjs --dry-run --company Cohere` | 71 parser jobs, 33 dry-run new offers after scanner filters/dedup | 0 | `scan.mjs` uses local Python + JSON parsing and does not send the scraped data to an LLM |

## Token Estimate Disclaimer

Cursor does not expose exact billable token usage per slash-command/tool run in this environment, so the Playwright number above is a payload estimate, not an invoice-grade token counter.

The estimate uses the rendered page body size as a proxy for what an agent would need to read from the browser snapshot. Actual model input can differ because browser snapshots include accessibility structure, refs, prompt context, tool-call metadata, and conversation history. A compact snapshot may be smaller than raw page text; a full agent run with surrounding instructions may be larger.

The local parser result is different: the search itself uses zero LLM tokens because `scan.mjs` runs locally. If the full parser JSON were pasted back into the chat for analysis, that would consume tokens, but that is not part of the scanner search path.

## Test Plan

- Ran `node scan.mjs --dry-run --company Cohere` after temporarily enabling Cohere in `portals.yml`.
- Confirmed dry-run mode did not write to `data/pipeline.md` or `data/scan-history.tsv`.
- Restored `portals.yml` after the test.
- Ran a headless Playwright script to render and measure the Cohere Ashby board payload.
