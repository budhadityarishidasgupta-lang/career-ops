# Evaluación: Qualified Health PBC — Epic Forward Deployed Engineer

**Fecha:** 2026-05-11
**Arquetipo:** AI Solutions / Forward Deployed Engineer (healthcare-EHR integration tilt)
**Score:** 2.4/5
**URL:** https://jobs.ashbyhq.com/qualified-health-pbc/88dc8b6a-8aaf-4f0a-8c1a-a0249d647dd4
**Legitimacy:** High Confidence
**Location:** United States — Remote (US) + up to 30% travel to health system client sites
**PDF:** Not generated (score < 3.0)

---

## A) Resumen del Rol

| Field | Value |
|---|---|
| Arquetipo | Epic-specialist Forward Deployed Engineer at a generative-AI healthcare startup |
| Domain | Healthcare AI infrastructure — guardrails, governance, healthcare-specific agents, real-time algorithm monitoring; embedded with health-system clients to design and validate Epic integrations |
| Function | On-site (or virtually embedded) technical resource for 1-2 health system clients; lead Epic workflow discovery; design Bridges interface configs / FHIR R4 / CDS Hooks / SMART on FHIR app placement; own end-to-end testing |
| Seniority | 5+ years required in Epic implementation, health-system clinical apps, healthcare IT integration, or SMART on FHIR app development |
| Remote | Remote US + up to 30% travel to client sites |
| Team size | Data Engineering org (per Ashby payload); seed/early-stage healthcare AI startup |
| TL;DR | Domain is a 1:1 match (healthcare RAG + agentic LLM + HIPAA governance) but the role requires Epic certification + 5+ years of Epic implementation experience that Deepak does not have. The JD is explicit: "this is a hands-on, client-facing, solution-design role — not a back-office engineering position." Candidate's strengths (Python + RAG + agentic workflows) are explicitly not what this role wants. SKIP. |

## B) Match con CV

| JD requirement | CV evidence |
|---|---|
| Healthcare domain context + HIPAA familiarity | Progress Solutions healthcare RAG + agentic LLM workflows + HIPAA-conscious data governance + de-identification + data lineage docs (cv.md L25-30); Agentic Healthcare Claims pipeline with CPT/ICD validation (cv.md L72) |
| Client-facing solution design + workflow discovery sessions | Stakeholder-facing system-limitation docs at Progress (cv.md L30); Suvidha Foundation: Flask API + UI for non-technical staff (cv.md L47); E-Farming founder full discovery + ship loop (cv.md L87) |
| Owns end-to-end testing + validation from platform output to point of care | FastAPI/Flask packaging with structured logging + load simulation + ~30% defect reduction (cv.md L28); evaluation pipelines + retrieval-grounded response alignment >90% (cv.md L25) |
| Translate field learnings into structured platform requirements | Stakeholder-facing system-limitation docs (cv.md L30); structured prompt transformation layers in Dream Decoder (cv.md L66) |
| Comfortable with HL7 v2 + FHIR R4 message structures, data flows, integration patterns | **GAP** — no explicit HL7/FHIR experience in CV. Healthcare RAG work is on de-identified extracts, not Epic-native interfaces |
| 5+ years Epic implementation / health-system clinical apps / healthcare IT integration / SMART on FHIR development | **HARD GAP** — Deepak has 2.5y healthcare AI exp at Progress, no Epic implementation, no SMART on FHIR app development |
| Direct hands-on experience with at least one Epic module (Bridges, Ambulatory, ClinDoc, MyChart, Orders, BPAs) in build/config/implementation | **HARD GAP** — no Epic module experience on CV |
| Epic Project Workplan + build envs + go-live cutover (Archetype A) | **HARD GAP** — never done an Epic go-live |
| Clinical workflow design from provider side / political dynamics of health system IT governance (Archetype B) | **GAP** — exposure is via Progress customer engagements, not provider-side employment |

**Gaps (consolidated):**
1. **5+ years Epic experience is the floor — Deepak has zero.** This is the JD's primary screen and it is a non-negotiable for either Archetype A (Epic implementer) or Archetype B (health-system informatics). The job explicitly says "this is not a back-office engineering position" — i.e. Python + RAG + agentic skills do not substitute.
2. **No Epic certification.** Epic certifications are gated by employer sponsorship; without that on CV the screen is automatic-reject.
3. **No HL7/FHIR hands-on experience.** RAG over de-identified EHR extracts is different from designing an HL7 v2 interface or a FHIR R4 endpoint.
4. **Travel up to 30% to client sites.** Manageable but not free — adds friction on top of fundamental skill gap.

## C) Nivel y Estrategia

- JD floor: 5+ years Epic implementation / clinical informatics / SMART on FHIR development. Deepak is 0 years on all three.
- Realistic outcome: **SKIP**. The fundamental skill gap (Epic + HL7/FHIR) cannot be bridged by application-letter framing. This is a role for an Epic analyst pivoting into AI delivery, not for an applied AI engineer pivoting into Epic.
- If applying as a stretch: lead with healthcare RAG + HIPAA governance + customer-facing system-limitation docs, then be explicit about the Epic-experience gap and propose a 6-month ramp plan (Epic certifications, SMART on FHIR developer cert, FHIR R4 deep-dive). Expect a polite no.

## D) Comp y Demanda

| Source | Number | Notes |
|---|---|---|
| Qualified Health PBC JD | Not disclosed (compensationTierSummary null) | — |
| Levels.fyi - Healthcare AI startup FDE (seed/Series A) | $140-200K base + 0.1-0.5% equity | Mid-FDE band; senior FDE up to $250K |
| Glassdoor - Epic Forward Deployed Engineer | $150-220K base | Niche role, Epic-cert premium |
| Built In - Healthcare AI Solutions Engineer | $140-190K base | Median |
| Epic certification market | 2-4x base for certified Epic analysts | Epic-cert is a real comp driver |

Expected: $160-220K base + equity. Epic-certified candidates command a premium; an applied-AI engineer without Epic experience would land closer to the floor or get filtered out before comp discussion.

## E) Plan de Personalización

**Recommendation: SKIP.** If pursuing anyway:

| # | Sección | Estado actual | Cambio propuesto | Por qué |
|---|---|---|---|---|
| 1 | Summary | Healthcare RAG + agentic ML | "Applied AI engineer with 2.5 years of healthcare RAG + agentic LLM delivery at Progress, HIPAA-conscious data governance, and stakeholder-facing system-limitation docs. Open to ramp on Epic + FHIR R4 + SMART on FHIR." | Be honest about the gap; lead with the transferable healthcare-AI primitive |
| 2 | Cover letter | n/a | Open with "I have shipped healthcare AI in production at Progress (~35% retrieval precision gain, ~25% agent stability, HIPAA-conscious governance, stakeholder-facing system-limitation docs) but have not worked inside an Epic build environment. If the team is open to a candidate with strong healthcare AI delivery and a 6-month Epic + FHIR ramp plan, I would value a conversation." | Frame the gap honestly so the recruiter can decide; do not pretend Epic experience |
| 3 | Bullets (Progress) | Patient-outcome ordering | Lead with HIPAA + audit trails + system-limitation docs → agentic LLM workflows → RAG retrieval → predictive ML | JD weights healthcare governance + customer-facing solution design highest among non-Epic primitives |

## F) Plan de Entrevistas

| # | JD requirement | STAR+R |
|---|---|---|
| 1 | Healthcare AI deployment + HIPAA-conscious governance | S: Progress shipping agentic LLM workflows + RAG to healthcare customers; T: maintain HIPAA-conscious data governance throughout; A: de-identification + data lineage docs + evaluation audit trails + stakeholder-facing system-limitation docs; R: ~30% defect reduction post-deployment + continued customer use; **Reflection:** HIPAA-conscious governance is mostly process discipline + documentation contract, not exotic technology |
| 2 | Solution design + customer-facing technical communication | S: Progress customers needed clinical workflow automation but did not speak ML; T: translate retrieval precision + hallucination reduction metrics into clinical-impact language; A: system-limitation docs + audit trails + retrieval-grounded response alignment >90% in evaluation as a trust contract; R: continued usage + customer trust; **Reflection:** the metric that lands is the failure-mode doc, not the headline F1 |
| 3 | End-to-end testing + validation discipline | S: FastAPI/Flask packaging at Progress with structured logging + load simulation; T: ship reliable inference services; A: containerized with Docker + structured logging + load testing + retrieval-grounded eval; R: ~30% defect reduction; **Reflection:** the validation surface that matters is the one a customer trusts — i.e. the audit trail, not the unit-test coverage |
| 4 | Translate field learnings into platform requirements | S: Dream Decoder needed coordinated multimodal output but naïve direct prompts failed; T: design a transformation layer; A: intermediate structured prompt transformation layers between Sonar + Replicate; R: ~30% contextual alignment + ~25-30% first-pass image success; **Reflection:** field learnings translate to platform requirements when the abstraction sits at the contract layer between systems, not inside one system |
| 5 | Workflow discovery + adoption | S: E-Farming had no playbook; T: deliver a marketplace small-farmers actually used; A: farmer-interview discovery + onboarding flow + cart + reviews + community blog; R: 80-120 active users phase one; **Reflection:** discovery is more decisive than build — most of the platform was simple, the hard part was matching the buying workflow |

Red-flag prep:
- "Have you worked in an Epic build environment?" → No, never inside Epic. My healthcare work is on de-identified extracts. I have shipped RAG + agentic workflows in production at Progress with HIPAA-conscious governance, but Epic Bridges + FHIR R4 + SMART on FHIR + CDS Hooks are a ramp I would need to make.
- "Why apply without Epic?" → I am applying because the AI half of the role (healthcare-specific agents, governance, real-time algorithm monitoring) maps 1:1 to my Progress work. If the team has Epic-experienced peers and is open to a 6-month ramp, I would value a conversation. If the role requires Epic from day one, I understand it is not the right fit.
- "F-1 OPT?" → US-based, OPT-eligible now (Master's May 2025), STEM extension available. Long-term sponsorship would be needed.

## G) Posting Legitimacy

**Assessment:** High Confidence

| Signal | Finding | Weight |
|---|---|---|
| Apply button | Active (Ashby GraphQL `jobPosting` returns full payload 2026-05-11; jobId 88dc8b6a-... isListed:true) | Positive |
| Description quality | Specific: named Epic modules (Bridges, Ambulatory, ClinDoc, MyChart, Orders, BPAs), interface types (Bridges, FHIR R4, CDS Hooks, SMART on FHIR, SendMessage, MDM T02), two clear "Archetype A" / "Archetype B" candidate paths | Positive |
| Comp transparency | Not disclosed; healthcare AI startup FDE band $160-220K expected | Mixed |
| Visa | Not addressed in JD; verify in screen | Mixed |
| Company state | Healthcare AI startup with safe AI governance + healthcare-specific agents; legitimate vertical; working with health systems | Positive |
| Reposting | First time in scan-history 2026-05-11; published 2026-05-06 (5 days old) | Positive |
| Role-company fit | Epic FDE is structurally needed for any health-system-AI integration company — this is core to the business model | Positive |

**Context Notes:** Real, recently published (5 days) posting at a legitimate healthcare AI startup. Veto for this candidate is the 5+ years Epic experience floor, not posting legitimacy.

## H) Draft Application Answers

Not generated — score 2.4 below 4.5 threshold.

---

## Keywords extraídas

Qualified Health, Epic, Forward Deployed Engineer, healthcare AI, generative AI, HIPAA, FHIR R4, HL7 v2, CDS Hooks, SMART on FHIR, Bridges, Ambulatory, ClinDoc, MyChart, Orders, BPAs, clinical informatics, workflow discovery, integration architecture, point of care, audit trails, real-time algorithm monitoring, healthcare-specific agents, AI governance, remote US, 30% travel, 5+ years experience.
