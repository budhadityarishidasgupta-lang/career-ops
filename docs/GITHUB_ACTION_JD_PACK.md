# GitHub Action: JD Application Pack

This workflow lets you run the repo directly from GitHub and generate:

1. Comprehensive scoring
2. Customized CV (copy-paste)
3. Customized cover letter (copy-paste)

No PDF is generated.

## One-time setup

1. In GitHub, open your repo settings.
2. Go to `Settings -> Secrets and variables -> Actions`.
3. Add repository secret:
   - Name: `OPENAI_API_KEY`
   - Value: your OpenAI API key

## Run every time

1. Open `Actions` tab in the repo.
2. Select workflow: `JD Application Pack`.
3. Click `Run workflow`.
4. Paste:
   - `jd_text` (required)
   - `company_profile` (optional, recommended)
5. Click `Run workflow`.

## Get output

1. Open the completed workflow run.
2. Download artifact: `application-pack`.
3. Open `application-pack.md` and copy-paste sections.

## Notes

- The workflow reads `cv.md` from repo root as canonical base CV.
- If `OPENAI_API_KEY` is missing, the workflow fails with a clear error.
- Default model is `gpt-4.1` (override in workflow input if needed).

