import os
from pathlib import Path

import streamlit as st
from openai import OpenAI


st.set_page_config(page_title="Career-Ops JD Pack", page_icon="🧭", layout="wide")

st.title("Career-Ops: JD -> Scoring + CV + Cover Letter")
st.caption("Paste JD + company profile and get copy-paste-ready outputs. No PDF step.")

cv_path = Path("cv.md")
if not cv_path.exists():
    st.error("`cv.md` not found in repo root. Add your canonical base CV first.")
    st.stop()

api_key = os.getenv("OPENAI_API_KEY", "").strip()
if not api_key:
    st.warning("Set `OPENAI_API_KEY` in environment variables (Render -> Environment).")

jd_text = st.text_area("Job Description (required)", height=260, placeholder="Paste JD here...")
company_profile = st.text_area(
    "Company Profile from LinkedIn (optional)",
    height=180,
    placeholder="Paste company profile/context here...",
)
model = st.text_input("Model", value=os.getenv("OPENAI_MODEL", "gpt-4.1"))

run = st.button("Generate Application Pack", type="primary", use_container_width=True)

if run:
    if not jd_text.strip():
        st.error("Please paste the job description.")
        st.stop()
    if not api_key:
        st.error("Missing `OPENAI_API_KEY` environment variable.")
        st.stop()

    cv_text = cv_path.read_text(encoding="utf-8")
    client = OpenAI(api_key=api_key)

    system_prompt = "\n".join(
        [
            "You are an expert job application strategist.",
            "Use cv.md as canonical truth. Never invent claims, metrics, tools, dates, or responsibilities.",
            "Return markdown only with exactly these sections in order:",
            "## 1) Comprehensive Scoring",
            "## 2) Customized CV (Copy-Paste)",
            "## 3) Customized Cover Letter (Copy-Paste)",
            "For scoring, provide A-G style summary and final score out of 5 with risks and mitigations.",
            "For CV, produce ATS-friendly markdown with role-aligned summary, skills, and tailored experience bullets.",
            "For cover letter, keep concise, role-specific, and company-specific.",
        ]
    )

    user_prompt = "\n".join(
        [
            "Base CV (canonical source):",
            cv_text,
            "",
            "Job Description:",
            jd_text,
            "",
            "Company Profile:",
            company_profile if company_profile.strip() else "(not provided)",
        ]
    )

    with st.spinner("Generating..."):
        response = client.responses.create(
            model=model,
            input=[
                {"role": "system", "content": [{"type": "input_text", "text": system_prompt}]},
                {"role": "user", "content": [{"type": "input_text", "text": user_prompt}]},
            ],
        )
        output = response.output_text or ""

    if not output.strip():
        st.error("Model returned empty output. Try again.")
        st.stop()

    st.success("Generated.")
    st.markdown(output)
    st.download_button(
        label="Download as Markdown",
        data=output.encode("utf-8"),
        file_name="application-pack.md",
        mime="text/markdown",
        use_container_width=True,
    )
