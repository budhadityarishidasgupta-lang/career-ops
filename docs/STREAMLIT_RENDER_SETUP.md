# Streamlit Web App on Render

This gives you a browser UI:
- Paste JD
- Paste company profile
- Click generate
- Copy-paste output directly

## Files added

- `streamlit_app.py`
- `requirements-streamlit.txt`
- `render.yaml`

## Deploy on Render

1. Push these files to your GitHub repo.
2. In Render, create a new Blueprint service from this repo.
3. Render will detect `render.yaml` and create `career-ops-streamlit`.
4. In Render environment variables, set:
   - `OPENAI_API_KEY` = your OpenAI API key
   - (optional) `OPENAI_MODEL` = default `gpt-4.1`
5. Deploy.

## Use

1. Open your Render URL.
2. Paste JD.
3. Paste company profile from LinkedIn.
4. Click **Generate Application Pack**.
5. Copy from page or download `application-pack.md`.

## Notes

- The app reads `cv.md` from repo root as canonical base CV.
- Output sections are fixed:
  1. Comprehensive Scoring
  2. Customized CV (Copy-Paste)
  3. Customized Cover Letter (Copy-Paste)
