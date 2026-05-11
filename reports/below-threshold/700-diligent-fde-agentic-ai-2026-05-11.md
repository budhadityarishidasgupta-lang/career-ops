# Evaluación: Diligent — Forward Deployed Engineer, Agentic AI

**Fecha:** 2026-05-11
**Arquetipo:** AI Solutions / Forward Deployed Engineer + Agentic / Automation (GRC tilt)
**Score:** 1.9/5
**URL:** https://job-boards.greenhouse.io/diligentcorporation/jobs/5829760004
**Legitimacy:** High Confidence
**Location:** London, England, UK — Hybrid 50% min office + ~80% customer-facing travel across EU/US
**PDF:** Not generated (score < 3.0)

---

## A) Resumen del Rol

| Field | Value |
|---|---|
| Arquetipo | Forward Deployed Engineer for agentic AI inside Governance / Risk / Compliance (GRC) at Diligent |
| Domain | Enterprise GRC (banks, regulated corporates, audit + risk functions) — shipping production agents with compliance-grade reliability |
| Function | 80% customer-embedded (discovery, prototype, validate, ship agents) + 20% product feedback loop |
| Seniority | Mid-to-senior; floor is "shipped at least one production agent and know the reliability cliff" |
| Remote | London base; hybrid 50% office min; ~80% customer-facing travel across EU + US |
| Team size | Not specified; reports into a regional agentic AI delivery org |
| TL;DR | Strong stack 1:1 (agent eval + guardrails + observability + RAG primitives) but UK-base + F-1 OPT visa veto + GRC domain unfamiliarity + extensive EU/US travel makes this a hard pass. Score reflects geo+visa veto, not skill misalignment. |

## B) Match con CV

| JD requirement | CV evidence |
|---|---|
| Shipped at least one production agent | Agentic Healthcare Claims pipeline with schema-validated JSON contracts between agents (cv.md L72); agentic LLM workflows at Progress with structured reasoning + grounding + ~25% stability gain (cv.md L26) |
| Full agent dev lifecycle: evaluation, guardrails, observability, regression | Evaluation pipelines + guardrails + grounding + structured outputs called out explicitly in cv.md L13; HIPAA-conscious audit trails + system-limitation docs (cv.md L30) |
| Distinguish workflows needing agents vs. simple automation | Multi-stage agent decomposition in Agentic Healthcare Claims (intake → validation → consistency → duplicate → fraud); RAG vs deterministic split in Manga Lens (LLM only on captured panels, deterministic on cache) |
| Discovery workshops + prototype + validate + ship | E-Farming founder loop (cv.md L87); Manga Lens shipped solo Manifest V3 (cv.md L60); Dream Decoder full-stack FastAPI + React (cv.md L66); Progress agentic LLM workflows shipped end-to-end (cv.md L26) |
| Build eval infrastructure + golden datasets + catch regressions | Evaluation pipelines mention in cv.md L13; retrieval-grounded response alignment >90% in evaluation (cv.md L25); ~85% highlight alignment with human curation (cv.md L45) |
| C-suite risk professionals + audit/compliance workflows | Stakeholder-facing system-limitation docs (cv.md L30); HIPAA-conscious environment ≠ GRC but adjacent in regulated-domain governance |
| Comfortable with technical debugging + customer-side coding | Manga Lens debugging across 29 site selectors + 4 providers (cv.md L60); Progress packaging FastAPI/Flask + Docker + structured logging (cv.md L28) |

**Gaps:**
1. **UK base + 50% office minimum (London):** Hard veto for F-1 OPT US-based candidate. Relocation + visa transfer to UK Skilled Worker route is non-trivial and the JD does not address sponsorship. Diligent does sponsor in UK but this is materially different from the candidate's current US OPT path.
2. **80% customer-facing travel across EU + US:** Even if visa cleared, this travel intensity is heavy for an early-career FDE. Comp not disclosed so cannot weigh per-diem compensation.
3. **GRC domain unfamiliarity:** Deepak's regulated-domain work is healthcare (HIPAA), not GRC (audit committees, internal controls, SOX, KYC). Adjacent but a real ramp.
4. **"Shipped a production agent" requirement:** Healthcare Claims is described as ongoing/portfolio, not a customer-shipped production agent. Progress agentic LLM workflows are a closer match but the customer-shipped framing is not as strong as the JD wants.

## C) Nivel y Estrategia

- JD floor: shipped agent + reliability cliff felt + customer-facing C-suite comfort. That's senior-IC band.
- Candidate sits at upper-junior / lower-mid. The reliability + audit experience is real (HIPAA + ~25% agent stability gain + audit trails) but the customer-shipped agent framing is weaker than the JD wants.
- Sell: emphasize Healthcare Claims pipeline architecture + audit trails + HIPAA-conscious governance as the directly-transferable primitive. Frame Manga Lens as the customer-shipped artifact (4 providers, 29 sites, Chrome Web Store, paying-user pressure).
- Realistic outcome: SKIP. UK + visa + GRC + senior framing combined makes the cost/benefit poor.

## D) Comp y Demanda

| Source | Number | Notes |
|---|---|---|
| Diligent UK FDE Agentic AI JD | Not disclosed | London-based comp typically £75-120K |
| Glassdoor UK FDE / Solutions Engineer | £70-110K base | Median London |
| Levels.fyi London FDE Series C+ | £80-130K base + equity | Diligent is a public/large private company |
| Travel allowance | Likely standard per-diem | Not disclosed in JD |

Comp expected: £80-110K base + standard benefits. After UK income tax + cost of living + relocation/visa friction, net comp is materially lower than equivalent US-remote FDE roles.

## E) Plan de Personalización

| # | Sección | Estado actual | Cambio propuesto | Por qué |
|---|---|---|---|---|
| 1 | N/A | n/a | Do not pursue | UK base + visa veto + GRC domain ramp + travel intensity makes the application low-yield. Comp not disclosed makes the negotiation lever weak. |

If applying anyway:
| 1 | Summary | Healthcare RAG + agentic ML | "Applied AI engineer shipping multi-agent pipelines with schema-validated handoffs and audit-trail discipline in regulated healthcare. Founder of E-Farming and solo shipper of Manga Lens (Chrome Web Store, 4 vision providers, 29 sites)." | Mirrors GRC's reliability + audit framing |
| 2 | Bullets (Progress) | Patient-outcome ordering | Lead with agentic LLM workflows (tool discipline + grounding + audit trails + ~25% stability gain) → RAG retrieval ~35% precision → FastAPI/Docker packaging ~30% defect reduction | JD weights agent eval + guardrails + observability highest |

## F) Plan de Entrevistas

| # | JD requirement | STAR+R |
|---|---|---|
| 1 | Shipped at least one production agent — felt the reliability cliff | S: Progress healthcare customer needed multi-step agentic eligibility + care workflow navigation; T: ship reliable agentic LLM workflow; A: structured reasoning + tool discipline + grounding rules + audit trails + system-limitation docs; R: ~25% agent stability gain; **Reflection:** the reliability cliff was less about the model and more about the contract between agents — schema-validated handoffs were the difference between cascading hallucinations and reliable orchestration |
| 2 | Build eval infrastructure + golden datasets + catch regressions | S: Suvidha video summarization had no quality contract; T: ship a comparable, measurable evaluation surface; A: ~85% highlight alignment metric vs human curation + hierarchical summarization on 5,000+ recorded sessions; R: 60-70% reduction in manual review time + non-technical staff using daily; **Reflection:** the eval metric that lands with non-technical reviewers is time-saved-per-task, not F1 |
| 3 | C-suite + audit/compliance comfort | S: Progress stakeholder-facing system-limitation docs for clinical leadership; T: communicate retrieval precision + hallucination reduction without overselling; A: explicit failure modes + audit trails + HIPAA data lineage + evaluation audit trails; R: continued use + ~30% defect reduction; **Reflection:** the trust contract with regulated stakeholders is the failure-mode doc, not the headline metric |
| 4 | Customer-side coding + debugging | S: Manga Lens had to work across 29 manga/webtoon sites with different DOM structures; T: ship per-domain selector configs + debug 4 providers; A: viewport-slice screenshots + coordinate remapping + WebP vs JPEG provider routing + 7-day cache; R: live on Chrome Web Store solo; **Reflection:** debugging across customer environments is a config-and-fallback discipline, not a code-rewrite discipline |
| 5 | Distinguish agent-worthy from automation-worthy | S: Agentic Healthcare Claims had 5 stages; T: decide which need agents and which need deterministic logic; A: schema-validated JSON contracts where agents handed off, deterministic ANN search for duplicate detection, RAG-grounded validation for CPT/ICD; R: explainable risk scoring with audit-ready reasoning traces; **Reflection:** the choice is governed by tolerance for nondeterminism — duplicate detection is deterministic, fraud reasoning needs an agent |
| 6 | Discovery workshops + prototype + validate + ship | S: E-Farming had no playbook for small-farmer marketplace; T: deliver shipped MVP with real users; A: farmer-interview discovery + PHP/MySQL/Bootstrap + cart + reviews + community blog + onboarding flow; R: 80-120 active users phase one; **Reflection:** the discovery was more decisive than the build — most of the platform was simple, the hard part was matching the actual buying workflow |

Red-flag prep:
- "Why London base?" → I am Kent OH US-based on F-1 OPT; this role would require visa transfer + relocation. I am open to it if the role + comp justify the friction. Realistically — is there a US-based equivalent on the team?
- "GRC domain ramp?" → My regulated-domain work is healthcare (HIPAA); GRC primitives (audit committees, SOX, KYC) are new but the governance discipline transfers. I would ramp on the regulatory vocabulary in the first 30 days.
- "80% travel comfort?" → Open to it, but want to understand the rhythm (single-customer multi-week embeds vs. weekly travel). The customer embed model is what I want.

## G) Posting Legitimacy

**Assessment:** High Confidence

| Signal | Finding | Weight |
|---|---|---|
| Apply button | Active (Greenhouse standard form, ID 5829760004 returns full JD 2026-05-11) | Positive |
| Description quality | Specific: 80%/20% time split, "shipped at least one production agent" floor, named GRC customer base (banks, regulated corporates, audit/risk functions), agent dev lifecycle vocabulary (eval, guardrails, observability, regression, golden datasets) | Positive |
| Comp transparency | Not disclosed; UK FDE band £80-110K expected | Mixed |
| Visa | UK Skilled Worker question in application form; no explicit sponsorship policy | Mixed |
| Company state | Diligent is established GRC SaaS (public/large private); legitimate enterprise customer base | Positive |
| Reposting | First time seeing this role in scan-history 2026-05-11; no prior posts | Neutral |
| Role-company fit | Diligent's customers are GRC functions; agentic AI for compliance workflows is structurally on-strategy | Positive |

**Context Notes:** Legitimate posting at an established GRC SaaS. Real role with senior-floor framing. Veto factors for this candidate are geographic + work-authorization, not posting legitimacy.

## H) Draft Application Answers

Not generated — score 1.9 is below the 4.5 threshold. Block H per modes/oferta.md is reserved for score ≥ 4.5.

---

## Keywords extraídas

Forward Deployed Engineer, Agentic AI, Diligent, GRC, governance risk compliance, agent reliability, evaluation infrastructure, golden datasets, regression detection, customer-embedded, discovery workshops, prototype validation, C-suite, audit, compliance, regulated industries, banks, internal controls, London, hybrid, EU travel, US travel, production agent.
