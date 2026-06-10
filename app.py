"""
Career-Ops MVP — Enhanced Streamlit App
Tabs: CV Profile | Job Scout | JD Pack | Tracker | Settings
"""

import os
import re
import json
import time
import concurrent.futures
from pathlib import Path
from io import BytesIO
from datetime import datetime

import streamlit as st
import pdfplumber
from openai import OpenAI
from docx import Document

# ── Optional Apify ──────────────────────────────────────────────────
try:
    from apify_client import ApifyClient
    APIFY_AVAILABLE = True
except ImportError:
    APIFY_AVAILABLE = False

# ── Paths ────────────────────────────────────────────────────────────
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)
CV_PROFILE_PATH = DATA_DIR / "cv_profile.json"
TRACKER_PATH = DATA_DIR / "tracker.json"
SETTINGS_PATH = DATA_DIR / "settings.json"
CV_MD_PATH = Path("cv.md")

# ── Helpers ──────────────────────────────────────────────────────────

def load_json(path: Path, default):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            return default
    return default

def save_json(path: Path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))

def load_settings():
    return load_json(SETTINGS_PATH, {"openai_key": "", "apify_key": ""})

def save_settings(s):
    save_json(SETTINGS_PATH, s)

def get_openai_client():
    settings = load_settings()
    key = settings.get("openai_key") or os.getenv("OPENAI_API_KEY", "")
    if not key:
        return None
    return OpenAI(api_key=key)

def get_apify_key():
    settings = load_settings()
    return settings.get("apify_key") or os.getenv("APIFY_API_KEY", "")

def extract_pdf_text(uploaded_file) -> str:
    with pdfplumber.open(uploaded_file) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)

def parse_cv_with_llm(cv_text: str, client: OpenAI) -> dict:
    resp = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a CV parser. Extract these fields and return ONLY a JSON object: "
                    "full_name, current_job_title, years_of_experience (integer), "
                    "technical_skills (array of strings), "
                    "professional_summary (2 sentences max), "
                    "target_roles (array of strings inferred from CV), "
                    "preferred_locations (array of strings if mentioned, else [])."
                ),
            },
            {"role": "user", "content": cv_text},
        ],
        temperature=0.2,
        max_tokens=1000,
    )
    raw = resp.choices[0].message.content.strip()
    raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw)

def score_job(profile: dict, jd: str, client: OpenAI) -> int:
    profile_text = (
        f"Name: {profile.get('full_name')}\n"
        f"Title: {profile.get('current_job_title')}\n"
        f"Experience: {profile.get('years_of_experience')} years\n"
        f"Skills: {', '.join(profile.get('technical_skills', []))}\n"
        f"Summary: {profile.get('professional_summary')}"
    )
    resp = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a recruitment assistant. Given the candidate profile and job description, "
                    "return ONLY a JSON object with a single key 'score' (integer 0-100). No explanation."
                ),
            },
            {"role": "user", "content": f"Profile:\n{profile_text}\n\nJob Description:\n{jd}"},
        ],
        temperature=0.1,
        max_tokens=50,
    )
    raw = resp.choices[0].message.content.strip()
    raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()
    return json.loads(raw).get("score", 0)

def scrape_jobs_apify(query: str, location: str, platforms: list, count: int = 10) -> list:
    key = get_apify_key()
    if not key or not APIFY_AVAILABLE:
        return []
    client = ApifyClient(key)
    jobs = []
    # LinkedIn
    if "LinkedIn" in platforms:
        try:
            run = client.actor("curious_coder/linkedin-jobs-scraper").call(
                run_input={"queries": [{"query": query, "location": location}], "maxResults": count}
            )
            for item in client.dataset(run["defaultDatasetId"]).iterate_items():
                jobs.append({
                    "platform": "LinkedIn",
                    "title": item.get("title", ""),
                    "company": item.get("companyName", ""),
                    "location": item.get("location", ""),
                    "description": item.get("description", ""),
                    "url": item.get("jobUrl", ""),
                    "score": 0,
                    "status": "Saved",
                    "saved_at": datetime.now().isoformat(),
                })
        except Exception as e:
            st.warning(f"LinkedIn scrape error: {e}")
    # Indeed
    if "Indeed" in platforms:
        try:
            run = client.actor("misceres/indeed-scraper").call(
                run_input={"query": query, "location": location, "maxItems": count}
            )
            for item in client.dataset(run["defaultDatasetId"]).iterate_items():
                jobs.append({
                    "platform": "Indeed",
                    "title": item.get("positionName", ""),
                    "company": item.get("company", ""),
                    "location": item.get("location", ""),
                    "description": item.get("description", ""),
                    "url": item.get("url", ""),
                    "score": 0,
                    "status": "Saved",
                    "saved_at": datetime.now().isoformat(),
                })
        except Exception as e:
            st.warning(f"Indeed scrape error: {e}")
    # Seek
    if "Seek" in platforms:
        try:
            run = client.actor("bebity/seek-jobs-scraper").call(
                run_input={"keyword": query, "location": location, "maxItems": count}
            )
            for item in client.dataset(run["defaultDatasetId"]).iterate_items():
                jobs.append({
                    "platform": "Seek",
                    "title": item.get("title", ""),
                    "company": item.get("advertiser", {}).get("description", ""),
                    "location": item.get("location", ""),
                    "description": item.get("teaser", ""),
                    "url": item.get("jobUrl", ""),
                    "score": 0,
                    "status": "Saved",
                    "saved_at": datetime.now().isoformat(),
                })
        except Exception as e:
            st.warning(f"Seek scrape error: {e}")
    return jobs

def score_jobs_parallel(jobs: list, profile: dict, client: OpenAI) -> list:
    def _score(job):
        try:
            job["score"] = score_job(profile, job.get("description", ""), client)
        except Exception:
            job["score"] = 0
        return job
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
        return list(ex.map(_score, jobs))

def build_cv_tailor_prompt(cv_text: str, jd: str, company: str) -> tuple[str, str]:
    system = (
        "You are an expert job application strategist and ATS optimization specialist. "
        "Use the base CV as canonical truth. NEVER invent claims, metrics, tools, dates, or responsibilities. "
        "Return markdown with exactly these sections:\n"
        "## Fitment Score\n"
        "## ATS-Tailored CV\n"
        "## Cover Letter\n"
        "## Interview Prep (3 likely questions + answers)"
    )
    user = (
        f"Base CV:\n{cv_text}\n\n"
        f"Job Description:\n{jd}\n\n"
        f"Company Context:\n{company or 'Not provided'}"
    )
    return system, user

def markdown_to_docx(md: str) -> bytes:
    doc = Document()
    for line in md.splitlines():
        if line.startswith("## "):
            doc.add_heading(line[3:], level=2)
        elif line.startswith("# "):
            doc.add_heading(line[2:], level=1)
        elif re.match(r"^[-*]\s+", line):
            doc.add_paragraph(re.sub(r"^[-*]\s+", "", line).strip(), style="List Bullet")
        elif re.match(r"^\d+\.\s+", line):
            doc.add_paragraph(re.sub(r"^\d+\.\s+", "", line).strip(), style="List Number")
        elif line.strip():
            doc.add_paragraph(line)
    buf = BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.getvalue()

def score_badge(score: int) -> str:
    if score >= 70:
        return f"🟢 {score}%"
    elif score >= 40:
        return f"🟡 {score}%"
    return f"🔴 {score}%"

# ── App ──────────────────────────────────────────────────────────────

st.set_page_config(page_title="Career-Ops", page_icon="🧭", layout="wide")

st.markdown("""
<style>
.block-container { padding-top: 1.5rem; }
.stTabs [data-baseweb="tab"] { font-size: 15px; font-weight: 600; }
.job-card { border: 1px solid #2d3748; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px; background: #1a202c; }
</style>
""", unsafe_allow_html=True)

st.title("🧭 Career-Ops")
st.caption("AI-powered job scout, CV tailor, and application tracker — personal MVP")

tabs = st.tabs(["👤 CV Profile", "🔍 Job Scout", "✍️ JD Pack", "📋 Tracker", "⚙️ Settings"])

# ─────────────────────────────────────────────────────────────────────
# TAB 1 — CV PROFILE
# ─────────────────────────────────────────────────────────────────────
with tabs[0]:
    st.header("CV Profile")
    st.caption("Upload your CV once. All agents use this as the source of truth.")

    profile = load_json(CV_PROFILE_PATH, {})

    uploaded = st.file_uploader("Upload your CV (PDF)", type=["pdf"])
    if uploaded:
        client = get_openai_client()
        if not client:
            st.error("Set your OpenAI API key in ⚙️ Settings first.")
        else:
            with st.spinner("Parsing CV..."):
                cv_text = extract_pdf_text(uploaded)
                try:
                    profile = parse_cv_with_llm(cv_text, client)
                    profile["raw_text"] = cv_text
                    save_json(CV_PROFILE_PATH, profile)
                    # Also write cv.md for backward compat with existing pipeline
                    CV_MD_PATH.write_text(cv_text)
                    st.success("CV parsed and saved.")
                except Exception as e:
                    st.error(f"Parsing failed: {e}")

    if profile:
        col1, col2 = st.columns(2)
        with col1:
            st.subheader(profile.get("full_name", "—"))
            st.write(f"**Title:** {profile.get('current_job_title', '—')}")
            st.write(f"**Experience:** {profile.get('years_of_experience', '—')} years")
            st.write(f"**Target Roles:** {', '.join(profile.get('target_roles', []))}")
            st.write(f"**Preferred Locations:** {', '.join(profile.get('preferred_locations', []))}")
        with col2:
            st.write("**Technical Skills:**")
            skills = profile.get("technical_skills", [])
            st.write(", ".join(skills) if skills else "—")
            st.write("**Summary:**")
            st.info(profile.get("professional_summary", "—"))
    else:
        st.info("No CV profile yet. Upload your CV above.")

# ─────────────────────────────────────────────────────────────────────
# TAB 2 — JOB SCOUT
# ─────────────────────────────────────────────────────────────────────
with tabs[1]:
    st.header("Job Scout")
    st.caption("Search LinkedIn, Indeed, and Seek. Jobs are scored against your CV profile automatically.")

    profile = load_json(CV_PROFILE_PATH, {})
    if not profile:
        st.warning("Upload your CV in the **CV Profile** tab first.")
    else:
        col1, col2, col3 = st.columns([2, 2, 1])
        with col1:
            default_role = profile.get("target_roles", [""])[0] if profile.get("target_roles") else ""
            query = st.text_input("Job Title / Keywords", value=default_role)
        with col2:
            default_loc = profile.get("preferred_locations", [""])[0] if profile.get("preferred_locations") else ""
            location = st.text_input("Location", value=default_loc)
        with col3:
            count = st.number_input("Results per platform", min_value=3, max_value=20, value=8)

        platforms = st.multiselect(
            "Platforms", ["LinkedIn", "Indeed", "Seek"], default=["LinkedIn", "Indeed"]
        )

        if st.button("🔍 Fetch & Score Jobs", type="primary"):
            apify_key = get_apify_key()
            client = get_openai_client()
            if not apify_key:
                st.error("Set your Apify API key in ⚙️ Settings.")
            elif not client:
                st.error("Set your OpenAI API key in ⚙️ Settings.")
            elif not query or not location:
                st.error("Enter a job title and location.")
            else:
                with st.spinner("Scraping job boards..."):
                    jobs = scrape_jobs_apify(query, location, platforms, int(count))
                if not jobs:
                    st.error("No jobs returned. Check your Apify key and actor availability.")
                else:
                    with st.spinner(f"Scoring {len(jobs)} jobs against your CV..."):
                        jobs = score_jobs_parallel(jobs, profile, client)
                    jobs.sort(key=lambda j: j["score"], reverse=True)
                    st.session_state["scout_jobs"] = jobs
                    st.success(f"Found and scored {len(jobs)} jobs.")

        # Display results
        scout_jobs = st.session_state.get("scout_jobs", [])
        if scout_jobs:
            tracker_data = load_json(TRACKER_PATH, [])
            existing_urls = {j["url"] for j in tracker_data}

            for job in scout_jobs:
                with st.expander(
                    f"{score_badge(job['score'])}  **{job['title']}** — {job['company']} ({job['platform']})"
                ):
                    st.write(f"📍 {job['location']}  |  🔗 [{job['url']}]({job['url']})")
                    st.write(job.get("description", "")[:600] + "...")

                    c1, c2 = st.columns(2)
                    with c1:
                        if st.button("💾 Save to Tracker", key=f"save_{job['url']}"):
                            if job["url"] not in existing_urls:
                                tracker_data.append(job)
                                save_json(TRACKER_PATH, tracker_data)
                                existing_urls.add(job["url"])
                                st.success("Saved to Tracker.")
                            else:
                                st.info("Already in Tracker.")
                    with c2:
                        if st.button("✍️ Tailor CV for this job", key=f"tailor_{job['url']}"):
                            st.session_state["jdpack_jd"] = job.get("description", "")
                            st.session_state["jdpack_company"] = job.get("company", "")
                            st.info("Switched to JD Pack tab — your JD is pre-loaded.")

# ─────────────────────────────────────────────────────────────────────
# TAB 3 — JD PACK (CV Tailor)
# ─────────────────────────────────────────────────────────────────────
with tabs[2]:
    st.header("JD Pack — CV Tailor & Cover Letter")
    st.caption("Paste a JD (or use one from Job Scout). Get an ATS-tailored CV, cover letter, and interview prep.")

    client = get_openai_client()
    if not client:
        st.error("Set your OpenAI API key in ⚙️ Settings.")
    else:
        jd_text = st.text_area(
            "Job Description",
            height=220,
            value=st.session_state.get("jdpack_jd", ""),
            placeholder="Paste JD here or fetch from Job Scout tab...",
        )
        company_profile = st.text_area(
            "Company Context (optional)",
            height=100,
            value=st.session_state.get("jdpack_company", ""),
        )

        col1, col2 = st.columns(2)
        with col1:
            model = st.selectbox("Model", ["gpt-4.1-mini", "gpt-4.1", "gpt-4o"])
        with col2:
            max_tokens = st.slider("Max output tokens", 1000, 4000, 2000, 200)

        if st.button("⚡ Generate Application Pack", type="primary"):
            if not jd_text.strip():
                st.error("Paste a job description first.")
            else:
                cv_text = ""
                if CV_MD_PATH.exists():
                    cv_text = CV_MD_PATH.read_text()
                elif CV_PROFILE_PATH.exists():
                    cv_text = load_json(CV_PROFILE_PATH, {}).get("raw_text", "")

                if not cv_text:
                    st.error("No CV found. Upload your CV in the CV Profile tab first.")
                else:
                    system_p, user_p = build_cv_tailor_prompt(cv_text, jd_text, company_profile)
                    with st.spinner("Generating..."):
                        resp = client.chat.completions.create(
                            model=model,
                            messages=[
                                {"role": "system", "content": system_p},
                                {"role": "user", "content": user_p},
                            ],
                            max_tokens=max_tokens,
                            temperature=0.3,
                        )
                        output = resp.choices[0].message.content.strip()
                    st.session_state["jdpack_output"] = output
                    st.success("Generated.")

        output = st.session_state.get("jdpack_output", "")
        if output:
            st.markdown(output)
            d1, d2 = st.columns(2)
            with d1:
                st.download_button(
                    "⬇️ Download Markdown",
                    data=output.encode(),
                    file_name="application-pack.md",
                    mime="text/markdown",
                    use_container_width=True,
                )
            with d2:
                st.download_button(
                    "⬇️ Download Word (.docx)",
                    data=markdown_to_docx(output),
                    file_name="application-pack.docx",
                    mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    use_container_width=True,
                )

# ─────────────────────────────────────────────────────────────────────
# TAB 4 — TRACKER (Kanban)
# ─────────────────────────────────────────────────────────────────────
with tabs[3]:
    st.header("Application Tracker")
    st.caption("Drag-free Kanban — update status via dropdown. All changes persist.")

    STATUSES = ["Saved", "Applied", "Screening", "Interview", "Offer", "Rejected"]
    STATUS_ICONS = {"Saved": "💾", "Applied": "📤", "Screening": "🔍", "Interview": "🗣️", "Offer": "🎉", "Rejected": "❌"}

    tracker_data = load_json(TRACKER_PATH, [])

    if not tracker_data:
        st.info("No jobs tracked yet. Save jobs from the Job Scout tab.")
    else:
        # Summary row
        cols = st.columns(len(STATUSES))
        for i, s in enumerate(STATUSES):
            count_s = sum(1 for j in tracker_data if j.get("status") == s)
            cols[i].metric(f"{STATUS_ICONS[s]} {s}", count_s)

        st.divider()

        # Editable table per status
        changed = False
        for status in STATUSES:
            jobs_in_status = [j for j in tracker_data if j.get("status") == status]
            if not jobs_in_status:
                continue
            st.subheader(f"{STATUS_ICONS[status]} {status} ({len(jobs_in_status)})")
            for idx, job in enumerate(tracker_data):
                if job.get("status") != status:
                    continue
                with st.expander(f"**{job.get('title', '—')}** — {job.get('company', '—')}  {score_badge(job.get('score', 0))}"):
                    st.write(f"📍 {job.get('location', '—')}  |  🌐 {job.get('platform', '—')}")
                    st.write(f"🔗 [{job.get('url', '')}]({job.get('url', '')})")
                    new_status = st.selectbox(
                        "Update Status",
                        STATUSES,
                        index=STATUSES.index(job.get("status", "Saved")),
                        key=f"status_{idx}_{job.get('url', idx)}",
                    )
                    if new_status != job.get("status"):
                        tracker_data[idx]["status"] = new_status
                        tracker_data[idx]["updated_at"] = datetime.now().isoformat()
                        changed = True

                    if st.button("🗑️ Remove", key=f"del_{idx}_{job.get('url', idx)}"):
                        tracker_data.pop(idx)
                        save_json(TRACKER_PATH, tracker_data)
                        st.rerun()

        if changed:
            save_json(TRACKER_PATH, tracker_data)
            st.success("Tracker updated.")

        # Analytics
        st.divider()
        st.subheader("📊 Quick Stats")
        total = len(tracker_data)
        applied = sum(1 for j in tracker_data if j.get("status") not in ["Saved", "Rejected"])
        avg_score = round(sum(j.get("score", 0) for j in tracker_data) / total, 1) if total else 0
        responded = sum(1 for j in tracker_data if j.get("status") in ["Screening", "Interview", "Offer"])
        response_rate = round(responded / applied * 100, 1) if applied else 0

        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Total Tracked", total)
        m2.metric("Applied", applied)
        m3.metric("Response Rate", f"{response_rate}%")
        m4.metric("Avg Match Score", f"{avg_score}%")

# ─────────────────────────────────────────────────────────────────────
# TAB 5 — SETTINGS
# ─────────────────────────────────────────────────────────────────────
with tabs[4]:
    st.header("⚙️ Settings")
    settings = load_settings()

    st.subheader("API Keys")
    openai_key = st.text_input("OpenAI API Key", value=settings.get("openai_key", ""), type="password")
    apify_key = st.text_input(
        "Apify API Key",
        value=settings.get("apify_key", ""),
        type="password",
        help="Get from apify.com → Settings → Integrations",
    )

    if st.button("💾 Save Settings", type="primary"):
        save_settings({"openai_key": openai_key, "apify_key": apify_key})
        st.success("Settings saved.")

    st.divider()
    st.subheader("Apify Actor IDs (editable)")
    st.caption("These are the default actor IDs used for scraping. Change if you prefer different actors.")
    st.code(
        "LinkedIn:  curious_coder/linkedin-jobs-scraper\n"
        "Indeed:    misceres/indeed-scraper\n"
        "Seek:      bebity/seek-jobs-scraper",
        language="text",
    )

    st.divider()
    st.subheader("Data")
    if st.button("🗑️ Clear CV Profile"):
        CV_PROFILE_PATH.unlink(missing_ok=True)
        st.success("CV profile cleared.")
    if st.button("🗑️ Clear Tracker"):
        TRACKER_PATH.unlink(missing_ok=True)
        st.success("Tracker cleared.")
