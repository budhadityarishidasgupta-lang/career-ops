# Evaluación: Memrise — Junior AI Engineer

**Fecha:** 2026-05-08
**Arquetipo:** Generative AI / RAG Engineer + Applied AI / LLM Engineer
**Score:** 2.8/5
**URL:** https://apply.workable.com/memrise/j/4BA29FC5E4
**Legitimacy:** Proceed with Caution
**Location:** London, UK (Remote-friendly within UK)
**PDF:** Not generated (score < 3.0)

---

## A) Resumen del Rol

| Field | Value |
|-------|-------|
| Arquetipo | Junior AI engineer at language-learning consumer app |
| Domain | EdTech / Language learning — prompt chains, RAG-backed support, learning recommendations |
| Function | Design + tune prompt chains, build RAG pipelines, develop recommendations engine, build evaluation systems |
| Seniority | Junior (entry-level explicit) |
| Remote | London / UK Remote (per Indeed + ZipRecruiter UK + Hirify) |
| Team size | Memrise is established consumer EdTech (founded 2010); Platform team |
| TL;DR | Junior tier, tight stack 1:1 (prompt chain design + RAG + evaluation). London/UK location is a soft block for F-1 OPT (no UK relocation feasibility on short OPT runway). Solid archetype fit if remote-from-anywhere is on the table — verify in screen. |

## B) Match con CV

| JD requirement | CV evidence |
|---|---|
| Prompt engineering, prompt chain design + tuning | Agentic LLM workflows with structured reasoning + tool discipline + grounding rules (cv.md L26); intermediate structured prompt transformation layers in Dream Decoder ~30% contextual alignment gain (L66) |
| RAG pipelines for support bots / in-product answers | Healthcare RAG with ~35% retrieval precision gains + recursive semantic chunking + transformer embeddings (L25); Suvidha document Q&A with semantic chunking + embedding retrieval ~30% hallucination reduction (L46) |
| Recommendations engine for learning features | Adjacent — patient no-show + care engagement scoring + support prioritization with class weighting + threshold calibration (L27); recall 15-20% gain on high-risk |
| Evaluation systems | Retrieval-grounded response alignment >90%; ~25% agent response stability gain (L25-26); systematic eval discipline across LLM workflows |
| Python | 2.5y at Progress Solutions (L25-30); core stack across all projects |
| Kotlin | Not on CV — gap |
| Cross-functional collaboration | Stakeholder docs at Progress Solutions (L30); Suvidha non-technical staff API ergonomics (L48); Student Manager 150+ students coordination (L50-55) |

**Gaps:**
1. **Kotlin:** Not on CV; Memrise's mobile/Android stack uses Kotlin. Backend/AI work likely Python — confirm role split in screen.
2. **Recommendations engine:** Adjacent (predictive ML + risk scoring) but not direct collaborative-filtering / content-based recsys. Mitigate with Manga Lens per-domain config heuristic (29 sites) and Dream Decoder prompt orchestration as analogues.
3. **F-1 OPT + UK location:** Memrise is London-rooted; remote-from-UK only is a hard block. Remote-from-anywhere or US-payroll variant would be required. Verify in screen — likely block.

## C) Nivel y Estrategia

- JD: Junior — entry-level explicit (no experience floor visible).
- Candidate: 2.5y Progress Solutions + Master's Kent State + RAG/agentic production work + shipped Manga Lens. Above the junior floor.
- Sell senior-without-lying: lead with shipped Chrome extension + healthcare RAG + agentic claims pipeline + Dream Decoder multimodal — all directly map to "prompt chain + RAG + eval" Memrise lists.
- If downleveled: it IS junior — accept if remote-from-anywhere; comp aligned to UK junior AI band (£35-50K).

## D) Comp y Demanda

| Source | Number | Notes |
|---|---|---|
| Glassdoor — Junior AI Engineer London | £40K-£55K | UK base |
| LinkedIn — Memrise Engineer | Not disclosed | Memrise comp opacity |
| Levels.fyi — UK Junior AI / ML | £45K-£70K | National range |
| US-equivalent (if remote-from-US variant existed) | $90K-$130K | Hypothetical |

UK comp is materially lower than US-equivalent. F-1 OPT geo block makes this academic unless Memrise opens US-payroll variant.

## E) Plan de Personalización

| # | Sección | Estado actual | Cambio propuesto | Por qué |
|---|---|---|---|---|
| 1 | Summary | Healthcare RAG + agentic ML | "Master's-graduating applied AI engineer with shipped consumer product (Manga Lens) and production RAG/agentic systems; designs prompt chains, RAG pipelines, and evaluation harnesses" | Maps to Memrise prompt + RAG + eval focus |
| 2 | Bullets | Healthcare-first | Reframe RAG bullets around "in-product answers + support bot patterns"; surface eval discipline (alignment >90%, ~25% stability gain) | Mirrors JD language |
| 3 | Skills | Python-first | Surface prompt engineering + RAG + LangChain + LlamaIndex + embeddings + evaluation pipelines | Memrise core stack |
| 4 | Projects | Healthcare-heavy | Re-order: Dream Decoder (prompt orchestration + multimodal) → Manga Lens (consumer shipped) → Agentic Healthcare Claims → Suvidha RAG Q&A | Front-load consumer + prompt-chain work |
| 5 | Cover letter | n/a | Open with "Memrise's bet on prompt chains + RAG + eval is the same toolkit I shipped on healthcare RAG and Dream Decoder's multi-stage prompt transformation — language learning is just a different grounding corpus" | Bridges archetype + EdTech |

## F) Plan de Entrevistas

| # | JD requirement | STAR+R |
|---|---|---|
| 1 | Design + tune prompt chains for instruction-following + engagement | S: Dream Decoder needed dream interpretation → poetic reinterpretation → image synthesis to feel coherent; T: improve naïve direct-prompt orchestration; A: introduced intermediate structured prompt transformation layers between stages (interpretation → poetic → visual prompt); R: ~30% contextual alignment gain + ~25-30% first-pass image success rate; **Reflection:** the layer between stages is more decisive than the model choice — naïve "just prompt better" plateaus quickly |
| 2 | RAG pipelines for support bots + in-product answers | S: Progress Solutions clinical staff needed RAG over clinical documentation; T: ship retrieval that actually grounded responses; A: recursive semantic chunking + transformer-based embeddings + retrieval-grounded response alignment; R: ~35% retrieval precision gain + >90% alignment + >30% irrelevant retrieval reduction; **Reflection:** chunk strategy is what separates "RAG works in demo" from "RAG works for the long tail" |
| 3 | Build evaluation systems | S: Healthcare agentic workflows needed reliable behavior under varied inputs; T: instrument evals beyond eyeball check; A: structured reasoning + tool discipline + grounding rules + alignment scoring; R: ~25% agent response stability gain; **Reflection:** the eval suite IS the spec — without it, "improvement" is wishful thinking |
| 4 | Recommendations engine for learning features | S: Patient support prioritization needed risk-aware queueing; T: rank patients by likelihood of disengagement; A: scikit-learn + XGBoost with class weighting + stratified sampling + threshold calibration; R: 15-20% recall gain on high-risk while holding precision >90%; **Reflection:** the threshold IS the product decision — not the model |
| 5 | Cross-functional + non-technical adoption | S: Suvidha non-technical staff needed video summarization usable; T: ship API + UI + clip extraction; A: Flask API + lightweight web UI + transcript preprocessing; R: 60-70% review-time reduction + ~85% highlight alignment; **Reflection:** the API surface decides whether non-technical users adopt — the model quality is downstream of UX |

Red-flag prep:
- "Why are you applying from the US to a London role?" → Honest: depends on whether Memrise can hire remote-from-US or only UK-payroll. If UK-only, this isn't viable on F-1 OPT.
- "Kotlin?" → Not on CV; happy to ramp on backend Kotlin if the role splits Python-AI vs Kotlin-mobile that way.
- "Recommendations experience?" → Predictive ML + scoring stack carries; full collaborative-filtering work would be net-new but adjacent.

## G) Posting Legitimacy

**Assessment:** Proceed with Caution

| Signal | Finding | Weight |
|---|---|---|
| Apply button | Active on Workable + Indeed UK + ZipRecruiter UK + Hirify + Taro | Positive |
| Description quality | Medium — Workable JS-only render returned thin metadata; full content via UK aggregator mirrors confirms specific tech (prompt chains, RAG, recsys, Python, Kotlin, evaluation) | Positive |
| Company | Memrise founded 2010; established consumer EdTech (UK/US users); Platform team named | Positive |
| Comp transparency | Not disclosed on JD; UK norm | Neutral |
| Reposting | Single canonical Workable listing; aggregator mirrors fan out from same source | Positive |
| Layoffs / hiring freeze | None found in 2026; some 2023 retrenchment in EdTech sector but Memrise stable | Neutral |
| Geo legibility for F-1 OPT | London-rooted, UK Remote — likely UK-payroll only; F-1 OPT geo block | Concerning |

## H) Draft Application Answers

(Score 2.8 < 4.5 — H block omitted.)

---

## Keywords extraídas

Memrise, Junior AI Engineer, prompt chains, prompt engineering, RAG, retrieval augmented generation, support bots, in-product answers, recommendations engine, evaluation systems, Python, Kotlin, Platform team, language learning, EdTech, London, UK Remote.
