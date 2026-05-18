# Daily Application Pack Automation

This automation reads JDs from `jds/` and writes response-only packs to:

`output/app-packs/<job-slug>/application-pack.txt`

## GitHub-first setup (no local secrets required)

1. Push this repo to GitHub.
2. In GitHub repo settings, add secret:
   - `OPENAI_API_KEY` (Repository Settings → Secrets and variables → Actions → New repository secret)
3. Optional repo variable:
   - `OPENAI_MODEL` (defaults to `gpt-5.3-codex`)
4. Add JD files to `jds/` (`.md` or `.txt`).

## Trigger runs

- Manual: Actions → **Daily Application Pack** → **Run workflow**
- Scheduled: runs daily at `08:00 UTC` by default (cron in `.github/workflows/daily-app-pack.yml`)

## Where output goes

- Runtime output path: `output/app-packs/<job-slug>/application-pack.txt`
- Downloadable output: GitHub Actions artifact named `app-packs`

## Local run (optional)

If you ever run it locally, use env vars only:

```bash
export OPENAI_API_KEY="sk-..."
export OPENAI_MODEL="gpt-5.3-codex"
node batch/daily-app-pack.mjs
```

## Notes

- Output is written only in `output/` (gitignored).
- Script uses `cv.md` and `modes/_profile.md` as grounding context.
- No auto-apply actions are performed.
