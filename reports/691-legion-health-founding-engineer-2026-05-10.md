# Evaluación: Legion Health — Founding Engineer (AI-Native Mental Health Care)

**Fecha:** 2026-05-10
**Arquetipo:** Applied AI / LLM Engineer + Agentic Workflows (healthcare-native)
**Score:** 4.4/5
**URL:** https://www.workatastartup.com/jobs/86648
**Legitimacy:** High Confidence
**Location:** San Francisco, CA — In-person required
**PDF:** output/2026-05-10/cv-deepak-mallampati-legion-health-founding-engineer-2026-05-10.pdf

---

## A) Resumen del Rol

| Field | Value |
|---|---|
| Arquetipo | Founding Engineer at YC S21 healthcare AI agent platform; psychiatric-care vertical |
| Domain | AI-native mental health care; LLM agents that coordinate clinicians + patients + autonomous systems; HIPAA pipelines |
| Function | Own backend + agent systems end-to-end: event-driven Node/TS/Postgres, LLM agents (tool use, memory, retries, safety), human + AI ops UX, world-state modeling, HIPAA-compliant data pipelines, architecture strategy with CTO |
| Seniority | Any (new grads explicitly welcome) |
| Remote | San Francisco — In-person required |
| Team size | YC S21 startup, $3.3M+ ARR, $7M+ raised; founding-team layer |
| TL;DR | Best fit in this batch. Healthcare AI + agentic LLM workflows + RAG + HIPAA-compliant data pipelines is a 1:1 match with Healthcare RAG (Progress Solutions) + Multi-agent Healthcare Claims + Manga Lens (shipped) + Dream Decoder. Visa sponsorship YES, new grads explicitly welcome, comp transparent ($140-220K + 0.2-0.8% equity). Only friction is SF in-person → relocation required from Kent OH. |

## B) Match con CV

| JD requirement | CV evidence |
|---|---|
| Event-driven backend (Node/TS/Postgres/Supabase) | TypeScript + Manga Lens service workers + Dream Decoder FastAPI + React/TS/Vite/Tailwind (cv.md L60, L66); SQLite + PostgreSQL (L12); Patient Records app with normalized schema + FK constraints + cascade deletes + LEFT JOIN/GROUP_CONCAT (L84) |
| LLM agent implementation (tool use, memory, retries, safety) | Agentic LLM workflows for healthcare queries with structured reasoning + tool discipline + grounding rules + ~25% stability gain (L26); Agentic Healthcare Claims 5-stage pipeline with schema-validated JSON contracts to prevent cascading hallucinations + audit trace (L72) |
| Human + AI operations UX (internal tools for visibility) | Stakeholder-facing system-limitation docs at Progress (L30); Suvidha non-technical staff Flask UI (L48); Grafana dashboards for incident reduction (L37) |
| World-state modeling (canonical patient journey, alerting/routing) | Healthcare RAG state across eligibility checks + care navigation + documentation clarification (L26); Patient no-show + care engagement scoring with threshold calibration (L27) |
| Data security + HIPAA-compliant pipelines | HIPAA-conscious data governance: de-identification, data lineage, evaluation audit trails, system-limitation docs (L30); RBAC + audit logging in oil & gas compliance environment (L39) |
| RAG, embeddings, vector databases | Healthcare RAG with recursive semantic chunking + transformer embeddings; ~35% precision; >90% alignment (L25); Suvidha document Q&A with semantic chunking + embedding retrieval; ~30% hallucination reduction (L46); ANN duplicate detection in Claims pipeline (L72) |
| Langfuse-style observability | Evaluation pipelines + retrieval-grounded response alignment metric + grounding rules (L26); structured logging + load simulation (L28); Grafana DMV dashboards (L37) |
| Ownership shipping real systems (0→1 or 1→N) | Manga Lens shipped solo to Chrome Web Store (L60); E-Farming founder 0→80-120 users (L87); Agentic Pixel orchestrator (L62); Dream Decoder full-stack delivery (L66) |
| Systems thinking in events, state, invariants | Multi-agent Claims pipeline with explicit JSON schema contracts between agents (L72); Patient Records cascade deletes + aggregation (L84); Agentic Pixel phased system (L62-63) |
| LLM fluency OR strong backend foundation | BOTH: 2.5y of LLM agent + RAG production work + FastAPI/Flask/Docker reliability work (L25-30) |
| Healthcare/regulated domain exposure | 2.5y at Progress Solutions Healthcare Technology + HIPAA-conscious governance (L22-30); Patient Records app (L84) |
| Early-stage / founding team experience | E-Farming founder + Manga Lens shipped solo + Agentic Pixel ongoing solo (L87, L60, L62) |
| Tool calling + Anthropic/OpenAI | Manga Lens integrates Claude Sonnet + GPT-4o mini + GPT-4.1 Nano (L60); agentic workflows at Progress (L26) |

**Gaps:**
1. **SF in-person required + currently Kent OH:** Relocation needed. Mitigate: confirm relocation stipend in screen; this is a founding role so relocation discussion is normal.
2. **Node.js/TypeScript explicitly named (vs Python primary):** TS is on CV via Manga Lens + Dream Decoder; Node is adjacent. Frame: "I have shipped TS in production via Manga Lens; Node.js ramp from FastAPI/Flask is days, not weeks."
3. **Supabase specifically:** Postgres on CV; Supabase is a managed Postgres + auth + storage layer — direct ramp.
4. **Psychiatric care domain specifics:** No CV evidence. Frame Progress Solutions Healthcare Technology + HIPAA + Agentic Claims as the regulated-healthcare adjacency; psychiatric workflows are learnable in weeks given the agentic framework experience.

## C) Nivel y Estrategia

- JD: New grads explicitly welcome; "founding engineer" signals high autonomy + fast scope growth; CTO partnership.
- Candidate: 2.5y Progress + Master's (May 2025) + Manga Lens shipped + Agentic Healthcare Claims + Dream Decoder + E-Farming founder. Above the new-grad floor; founding-engineer fit is excellent.
- Sell: lead with the four production AI artifacts (Manga Lens, Agentic Healthcare Claims, Dream Decoder, Healthcare RAG at Progress) + HIPAA discipline + multi-provider vendor abstraction. Frame as "I have already done the agentic + RAG + HIPAA + ship-to-prod loop in healthcare; the founding-engineer scope is the natural step up."
- Comp ask: $170-200K base (mid-band) + 0.4-0.6% equity (mid of 0.2-0.8% range) given production track record above new-grad floor.

## D) Comp y Demanda

| Source | Number | Notes |
|---|---|---|
| Legion Health JD posted band | $140K-$220K + 0.2-0.8% equity | Disclosed |
| Levels.fyi - YC S21+ Founding Engineer SF | $160-220K base + 0.4-1.0% equity | Comparable cohort |
| Glassdoor - Founding Engineer SF | $180-240K base + 0.2-1.0% equity | Median |
| Built In SF - AI Engineer healthcare startup | $170-230K base | National median for healthcare AI eng |

Comp transparent and in-band for SF founding role. Equity meaningful (0.2-0.8% at YC S21 with $7M raised + $3M ARR).

## E) Plan de Personalización

| # | Sección | Estado actual | Cambio propuesto | Por qué |
|---|---|---|---|---|
| 1 | Summary | Healthcare RAG + agentic ML | "Applied AI engineer who ships production agentic LLM systems in regulated healthcare — RAG, tool-calling agents, HIPAA pipelines, audit trails. Founding-team mindset: shipped Chrome Web Store extension solo, ran multi-agent claims pipeline with schema-validated handoffs, founded an AgriTech marketplace." | Mirrors Legion's "founding engineer + healthcare AI agents + HIPAA" framing |
| 2 | Bullets | Patient-outcome-first | Reorder Progress bullets: agentic LLM workflows + tool discipline first; RAG + retrieval precision second; FastAPI/Docker third; predictive ML last. Add explicit "schema-validated JSON contracts" framing pulled from Claims pipeline. | JD weights agents > RAG > APIs > ML |
| 3 | Skills | Python-first | Surface TS/Node-adjacent + Postgres + tool calling + RAG + agent architectures + audit trails + multi-provider abstraction (Claude + OpenAI) | JD-keyword alignment |
| 4 | Projects | Healthcare-heavy | Reorder: Agentic Healthcare Claims (multi-agent + audit) → Manga Lens (shipped TS) → Dream Decoder (multimodal + structured prompt layers) → E-Farming (founder, 0→80-120 users) → Pixel agent orchestrator (phased) | Front-load agentic + shipped + founder + multimodal — all four explicitly map to Legion's stack |
| 5 | Cover letter | n/a | Open with "Legion's bet — that mental healthcare ops can be 95% automated with agents that coordinate clinicians, patients, and autonomous systems — is the same bet I have been shipping at Progress Solutions: agentic LLM workflows + RAG-grounded retrieval + HIPAA-conscious audit trails. The 5-stage Healthcare Claims pipeline I built (schema-validated JSON between agents to prevent cascading hallucinations) is a direct prototype of the patient-journey state machine you describe. I'd love to bring that discipline to mental health where the stakes are higher and the workflow ambiguity is greater." | Bridges archetype + name-checks the patient-journey state-machine concept + signals readiness |

## F) Plan de Entrevistas

| # | JD requirement | STAR+R |
|---|---|---|
| 1 | Build LLM agents with tool use + memory + retries + safety | S: Healthcare claims processing needed multi-step pipeline with no cascading hallucinations and audit-grade explainability; T: ship 5-stage agent pipeline in HIPAA-conscious environment; A: schema-validated JSON contracts between agents (Intake → Validation → Consistency → Duplicate → Risk Score) + RAG-grounded CPT/ICD validation against vector-indexed policy + ANN duplicate detection + explainable risk scoring with audit-ready reasoning traces; R: production-grade pipeline with cascade-hallucination prevention + audit explainability; **Reflection:** the JSON schema between agents IS the eval surface — if it parses, the next agent has a fighting chance. Safety isn't a final-stage check; it's the contract between every pair of agents. |
| 2 | Event-driven backend in Node/TS/Postgres | S: Patient Records management app needed normalized schema + audit-friendly queries; T: ship relational CRUD with audit-clean retrieval; A: SQLite with normalized patients/diagnoses + FK constraints + application-layer cascade deletes + LEFT JOIN/GROUP_CONCAT for single-query patient+diagnosis retrieval; R: clean retrieval API with explicit constraints; **Reflection:** the app-layer cascade was a deliberate trade — easier to audit and reverse than DB cascades. The same pattern applies to event-driven systems: explicit transitions beat implicit ones. |
| 3 | World-state modeling for patient journey | S: Healthcare RAG had to coordinate eligibility + care navigation + documentation clarification across multi-step queries; T: hold state across agent steps without losing grounding; A: agentic LLM workflows with structured reasoning + tool discipline + grounding rules + retrieval-grounded response alignment metric (>90%); R: ~25% agent stability + ~35% retrieval precision + >90% alignment; **Reflection:** state is what the next agent gets to read; if you can't serialize it, you can't reason about it |
| 4 | HIPAA-compliant data pipelines + audit trails | S: Healthcare RAG + Claims handled PHI; T: ship without breaking HIPAA discipline; A: de-identification + data lineage documentation + evaluation audit trails + system-limitation docs; on Energy Solutions side: RBAC + audit logging for financial modules; R: production HIPAA-conscious pipelines + ~30% deployment errors reduction with audit checkpoints; **Reflection:** the audit trail is the deliverable, not the side effect |
| 5 | Ship 0→1 with ownership | S: Manga Lens needed live AI-vision in a Chrome extension with no team; T: ship to Chrome Web Store; A: Manifest V3 + content scripts + service workers + 4-provider AI vision (Claude + 2x GPT + Ollama) + viewport-slice screenshots + per-domain selectors + 7-day cache + privacy policy; R: shipped solo + 29-site coverage + multi-provider abstraction; **Reflection:** the abstraction over providers is what keeps you shippable when one of them changes pricing or breaks |
| 6 | Real-time / scheduler / transcript ingestion | S: Suvidha needed video summarization across 5,000+ recorded sessions; T: ship transformer-based hierarchical summarization with timestamp-aligned clip extraction; A: transcript preprocessing + hierarchical abstractive summarization + Flask API + lightweight UI; R: 60-70% review-time reduction + ~85% highlight alignment with human curation; **Reflection:** the timestamp anchor is the contract between the model and the operator — without it the summarization is just a paragraph |
| 7 | Founding-team velocity + code quality | S: E-Farming AgriTech marketplace needed to onboard rural sellers solo; T: ship full-stack PHP/MySQL/Bootstrap + cart + reviews + community blog; A: independent design + delivery; R: 80-120 active users in phase one; **Reflection:** the first 10 users teach you 80% of what the next 100 need — velocity should serve learning, not the demo |

Red-flag prep:
- "Why mental health specifically?" → Honest answer: psychiatric workflows have higher stakes than clinical eligibility checks, more ambiguity, and higher need for audit-grade reasoning. The discipline I shipped at Progress (HIPAA + agent contracts + grounding) is exactly what mental-health ops needs at higher rigor.
- "Founding engineer + new grad — how do you think about scope?" → Lead with shipped Manga Lens + Agentic Claims + E-Farming founder. The track record is "I ship; I own; I iterate." New grad on paper, founder + production-engineer in practice.
- "Node.js / TypeScript / Supabase ramp?" → TS shipped via Manga Lens (Manifest V3 + service workers) + Dream Decoder (React/TS/Vite/Tailwind). Node from FastAPI/Flask is days. Supabase is managed Postgres + auth — direct ramp from SQLite + PostgreSQL.
- "F-1 OPT?" → US-based, OPT-eligible now, sponsorship needed long-term. Legion Health JD says "Visa sponsorship: Yes" — confirm in screen.
- "Why leave Progress Solutions?" → I shipped the production AI loop at Progress; Legion is the next step up — founding-team scope, higher stakes, agentic-first architecture.

## G) Posting Legitimacy

**Assessment:** High Confidence

| Signal | Finding | Weight |
|---|---|---|
| Apply button | Active on YC Work at a Startup + ycombinator.com/companies/legion-health/jobs | Positive |
| Description quality | Very high — names tech (Node, TS, Postgres, Supabase, AWS ECS/Lambda/S3, Next.js 15, OpenAI/Anthropic, Langfuse-style observability), specific responsibilities, interview process detail | Positive |
| Comp transparency | $140-220K base + 0.2-0.8% equity disclosed | Positive |
| Visa | Explicit "Yes" sponsorship | Positive |
| Layoffs / company state | YC S21, $7M+ raised, $3.3M+ ARR, recent regulatory approval for AI-led psychiatric medication renewals in Utah | Positive |
| Reposting | Single posting on YC; recent | Positive |
| Geo legibility | SF in-person explicit; sponsorship offered | Positive (relocation required but compensated context) |
| Interview process | 7-10 day timeline, specific format (45m systems + 1.5h work trial + 1.5h onsite); no LeetCode | Positive |

## H) Draft Application Answers

**Why Legion?**
The bet — that mental healthcare ops can be largely automated with agents that coordinate clinicians, patients, and autonomous systems — is the same bet I have been shipping at Progress Solutions: agentic LLM workflows + RAG-grounded retrieval + HIPAA-conscious audit trails. The 5-stage Healthcare Claims pipeline I built (schema-validated JSON between agents to prevent cascading hallucinations) is a direct prototype of the patient-journey state machine you describe. I want to bring that discipline to mental health, where the stakes are higher and the workflow ambiguity is greater.

**One shipped system you'd describe end-to-end:**
Manga Lens — a Chrome Web Store extension I shipped solo. Manifest V3 with content scripts, service workers, and `captureVisibleTab` for panel capture. Multi-section pipeline handles tall webtoon panels via viewport-slice screenshots with coordinate remapping and dedup. It integrates four AI vision providers (Claude Sonnet, GPT-4o mini, GPT-4.1 Nano, and local Ollama/minicpm-v) behind a single abstraction so a provider outage or pricing change does not break users. Per-domain selector configs cover 29 manga/webtoon sites; a 7-day translation cache keeps cost predictable. The hardest design decision was per-provider payload handling — WebP for cloud, JPEG for Ollama because of a CUDA crash with WebP. The lesson was that the abstraction over providers is the contract that keeps you shippable.

**Why now (and not after another job)?**
Two reasons. First, the founding-engineer surface (Node/TS/Postgres + LLM agents + HIPAA + Langfuse-style observability + AWS) is exactly the next layer of depth I want — same discipline as Progress Solutions, broader scope. Second, the market timing for healthcare AI agent companies that own the regulatory layer (your Utah AI-prescribing approval is the proof) is now; the founding cohort is the place to learn fastest.

---

## Keywords extraídas

Legion Health, Founding Engineer, AI-Native Mental Health Care, YC S21, psychiatric care, LLM agents, tool use, memory, retries, safety mechanisms, event-driven backend, Node.js, TypeScript, Supabase, Postgres, Next.js, AWS ECS, Lambda, S3, RAG, vector databases, embeddings, Langfuse, observability, HIPAA, audit trails, patient journey, world-state modeling, founding team, $7M raised, $3.3M ARR, San Francisco, in-person, visa sponsorship.
