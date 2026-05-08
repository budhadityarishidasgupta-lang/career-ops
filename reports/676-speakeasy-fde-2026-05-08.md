# Evaluación: Speakeasy — Forward Deployed Engineer

**Fecha:** 2026-05-08
**Arquetipo:** AI Solutions / Forward Deployed Engineer + AI Platform / MLOps Engineer
**Score:** 3.5/5
**URL:** https://jobs.ashbyhq.com/Speakeasy/def210b2-b6aa-421b-84c4-dcd278f95db9
**Legitimacy:** High Confidence
**Verification:** unconfirmed (Ashby SPA + sandbox DNS block; corroborated via Bandana mirror, Speakeasy careers page reference, ZipRecruiter salary range)
**Location:** San Francisco, CA — Remote / hybrid (HQ 644 Broadway, Russian Hill)
**PDF:** output/2026-05-08/cv-deepak-mallampati-speakeasy-fde-2026-05-08.pdf

---

## A) Resumen del Rol

| Field | Value |
|-------|-------|
| Arquetipo | FDE for SDK/API tooling SaaS — customer onboarding + integrations |
| Domain | Developer infrastructure / OpenAPI SDK & Terraform code generation |
| Function | Customer-facing implementation: onboarding, custom SDK integration, troubleshooting, productizing recurring patterns |
| Seniority | Mid IC tier (industry-standard FDE ~2-4y; Speakeasy SWE median $193K supports mid-band) |
| Remote | Listed Remote in Bandana mirror; HQ in SF (likely hybrid for SF candidates) |
| Team size | Series A dev-tools company (post-Y Combinator W21) |
| TL;DR | Speakeasy generates idiomatic SDKs + Terraform providers from OpenAPI specs. The FDE owns customer onboarding from first integration through scaled adoption — a strong fit for Deepak's API/SDK ergonomics + multi-provider integration history (Manga Lens 4 vision providers + Dream Decoder Replicate/Perplexity). $180-233K remote band per ZipRecruiter; verify F-1 OPT W-2 sponsorship. |

## B) Match con CV

| JD requirement | CV evidence |
|---|---|
| Customer-facing onboarding + integrations | Suvidha non-technical staff API + Flask + lightweight web UI (cv.md L48); founder of E-Farming with onboarded 80-120 users (L87); stakeholder docs at Progress Solutions (L30) |
| Build custom SDKs / multi-provider integrations | Manga Lens 4 vision providers (Claude / GPT-4o mini / GPT-4.1 Nano / Ollama) with per-provider payload handling (L60); Dream Decoder Perplexity Sonar + Replicate orchestration (L66) |
| OpenAPI / REST / API ergonomics | FastAPI/Flask packaging + Docker REST services (L28); RESTful APIs across all projects |
| Python | 2.5y at Progress Solutions (L25-30) — primary stack |
| TypeScript | Manga Lens TS Manifest V3 + service workers (L60); Dream Decoder React/TS/Vite (L66) |
| Customer empathy + product sense | E-Farming founder + onboarded farmers + buyers + community (L87); Suvidha non-technical UI (L48) |
| AI / LLM exposure (bonus, dev tools are increasingly AI-augmented) | RAG, agentic workflows, structured outputs (L13-14, L25-26) |
| Full deployment ownership | RAG + agentic + ML pipelines shipped end-to-end (L25-28) |

**Gaps:**
1. **Terraform / IaC:** Not on CV. Mitigation: cover-letter bridge from CI/CD experience at Energy Solutions (L36) + Docker (L28); learnable on the job.
2. **OpenAPI spec authoring:** Adjacent (used REST APIs heavily, never authored OpenAPI specs). Mitigation: portfolio of multi-provider integrations is the closest analog.
3. **Years of experience:** Speakeasy SWE median $193K typically maps to 3-5y; Deepak at 2.5y is on the lower side but the founder + shipped product evidence carries weight.

## C) Nivel y Estrategia

- JD: Mid-IC FDE, customer-facing, SDK ergonomics.
- Candidate: 2.5y Progress + Energy Solutions intern + Suvidha + founder of E-Farming + Manga Lens shipped solo. The multi-provider integration evidence (Manga Lens 4 vision providers, Dream Decoder Perplexity+Replicate) is the closest analog to "make customer SDKs work across heterogeneous environments."
- Sell senior-without-lying: lead with shipped multi-provider product + founder ownership + 2.5y healthcare AI integration.
- If downleveled: accept; Speakeasy's FDE role is intentionally fluid — ask for clear scope + 6-month review.

## D) Comp y Demanda

| Source | Number | Notes |
|---|---|---|
| ZipRecruiter — Remote FDE range | $180K – $233K | Min – max remote band |
| ZipRecruiter — FDE national avg | $116K – $147K/yr | Wider universe (non-AI) |
| Glassdoor — Speakeasy SWE median | $193,513 | All SWEs at Speakeasy |
| Levels.fyi — FDE | $198K – $631K | Wide; upper bands are senior/staff |
| 6figr — FDE national | $198K – $631K | Same caveat |

Demand for FDE in dev-tools / SDK gen is strong; Speakeasy customers include Vercel, Netlify, Cloudflare per public marketing.

## E) Plan de Personalización

| # | Sección | Estado actual | Cambio propuesto | Por qué |
|---|---|---|---|---|
| 1 | Summary | Healthcare RAG + agentic ML | "Applied AI engineer who has shipped a public Chrome extension integrating 4 vision providers and built multi-API orchestration layers — the same SDK ergonomics surface Speakeasy customers care about" | Maps to dev-tools/SDK integration |
| 2 | Bullets | Healthcare-first | Front-load Manga Lens (multi-provider abstraction + per-provider payload handling) + Dream Decoder (Perplexity + Replicate) + FastAPI/Flask packaging | Direct multi-provider analog |
| 3 | Skills | Generic LLM | Surface FastAPI + Flask + REST + Docker + multi-provider abstraction + TS/Manifest V3 | Speakeasy stack adjacency |
| 4 | Projects | Multiple | Lead Manga Lens → Dream Decoder → Agentic Claims → YOLOv8 (drop pixel/efarming) | Front-load multi-provider integration |
| 5 | Cover letter | n/a | Open with "Manga Lens taught me that the integration tax across heterogeneous AI providers is where customers actually feel friction — Speakeasy's SDK gen turns that tax into a one-time cost. I want to live on that customer-facing edge." | Bridges shipped multi-provider work to Speakeasy's value prop |

## F) Plan de Entrevistas

| # | JD requirement | STAR+R |
|---|---|---|
| 1 | Customer-facing onboarding | S: Suvidha needed video summarization usable by non-technical staff; T: ship a system they could operate; A: Flask API + lightweight web UI + clip extraction with timestamp alignment; R: 60-70% review-time reduction; **Reflection:** the API + UI are the onboarding — internal docs are not enough |
| 2 | Multi-provider integration | S: Manga Lens needed translation across 29 manga sites + 4 vision providers; T: ship shippable Chrome extension; A: Manifest V3 + content scripts + 4 provider abstraction + per-provider payload (WebP cloud, JPEG Ollama to avoid CUDA crash) + 7-day cache + per-domain selectors; R: shipped to Chrome Web Store; **Reflection:** provider abstractions break under real failure modes — payload handling is per-provider, not generic |
| 3 | API ergonomics + SDK design | S: Progress Solutions multi-stage RAG/agentic + ML services; T: serve clinical workflows with grounding + observability; A: FastAPI + Docker + structured logging + load simulation + ~35% retrieval precision; R: ~30% defect reduction post-deploy; **Reflection:** the contract between caller and service is the API — everything else is detail |
| 4 | Customer empathy + product sense | S: E-Farming AgriTech marketplace solo; T: onboard farmers + buyers + community on a single product; A: cart + reviews + community blog + onboarding flow + relational schema; R: 80-120 active users phase 1; **Reflection:** founders learn customer ergonomics by shipping the wrong thing first |
| 5 | Schema + contract design | S: Agentic Claims pipeline; T: prevent cascading hallucinations across 5 agents; A: schema-validated JSON contracts + RAG-grounded CPT/ICD validation + ANN duplicate detection + audit-ready reasoning traces; R: cascading hallucinations prevented; **Reflection:** schema contracts are how multi-system collaborations stay honest, in agents and SDKs alike |
| 6 | Full deployment ownership | S: predictive ML at Progress Solutions; T: ship no-show + engagement scoring; A: scikit-learn/XGBoost + class weighting + FastAPI + Docker + structured logging + load simulation; R: 15-20% recall on high-risk + 30% post-deploy defect reduction; **Reflection:** the model is 20% — the other 80% is everything that lets it survive the customer's environment |

Red-flag prep:
- "Terraform experience?" → Honest: not directly; CI/CD + Jenkins + Docker is the closest analog; will ramp quickly.
- "Why FDE vs SWE?" → Customer-facing pace + multi-provider integration is where my Manga Lens + Dream Decoder + healthcare RAG portfolio compounds.
- "F-1 OPT timeline?" → Verify Speakeasy sponsors STEM extension + future H1B.

## G) Posting Legitimacy

**Assessment:** High Confidence

| Signal | Finding | Weight |
|---|---|---|
| Apply button | Active on Ashby (verification: unconfirmed via SPA but corroborated by Bandana mirror + Speakeasy careers reference) | Positive |
| Description quality | Speakeasy public product (SDK gen + Terraform providers) is well-documented; FDE role is canonical for dev-tools cos | Positive |
| Company | YC W21 + named enterprise customers (Vercel, Netlify, Cloudflare per public marketing) | Positive |
| Comp transparency | Not on JD; ZipRecruiter remote FDE band $180-233K | Neutral |
| Reposting | First time in scan-history | Positive |
| Layoffs / hiring freeze | None found | Positive |

## H) Draft Application Answers

(Score 3.5 < 4.5 — H block omitted; revisit on interview.)

---

## Keywords extraídas

Speakeasy, Forward Deployed Engineer, FDE, OpenAPI, SDK generation, Terraform providers, customer onboarding, multi-provider integration, Python, TypeScript, REST APIs, dev tools, Y Combinator, Series A, San Francisco, remote.
