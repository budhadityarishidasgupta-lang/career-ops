# Evaluación: Maneva — Junior AI Engineer

**Fecha:** 2026-05-08
**Arquetipo:** Computer Vision / Multimodal Engineer + ML Engineer (Applied AI Systems)
**Score:** 2.7/5
**URL:** https://apply.workable.com/maneva/j/BFB7B810E9/
**Legitimacy:** Proceed with Caution
**Location:** Toronto / Montreal / San Francisco — Remote-first preferred
**PDF:** Not generated (score < 3.0)

---

## A) Resumen del Rol

| Field | Value |
|-------|-------|
| Arquetipo | Junior AI/CV engineer at manufacturing AI startup |
| Domain | Industrial AI — autonomous factory operation, vision models for classification/detection/segmentation |
| Function | Build + train CV models, MLOps tooling, performance monitoring, model maintenance |
| Seniority | Junior (entry-level explicit) |
| Remote | Remote-first (preference: Toronto, Montreal, San Francisco) |
| Team size | Early-stage startup; founded by ex-Google DeepMind researcher |
| TL;DR | Manufacturing-CV junior role; vision model training (classification/detection/segmentation) + MLOps; Canada-headquartered with US (SF) preference; F-1 OPT soft veto on Canadian payroll variants. Stack 1:1 on YOLOv8 + Python; manufacturing domain unfamiliar but adjacent to industrial systems work at Energy Solutions. |

## B) Match con CV

| JD requirement | CV evidence |
|---|---|
| Python | 2.5y at Progress Solutions (cv.md L25-30); core stack across all projects |
| Computer Vision (classification, object detection, segmentation) | YOLOv8 Driver Drowsiness Detection (L68-69); OpenCV; OpenPose/MediaPipe in Agentic Pixel Synthesis (L62-63) |
| Vision model training | YOLOv8 unified detection-and-classification — replaced two-stage CNN, ~30% latency reduction (L69) |
| MLOps tooling — setup, integration | Docker + FastAPI/Flask + structured logging + load simulation (L28); CI/CD with Jenkins (L36) |
| Model performance monitoring | Grafana dashboards for SQL/DMV monitoring (L37); structured logging post-deploy (L28) |
| Maintain deployed models | ~30% defect reduction post-deployment (L28) |
| Java / C++ | C++ (Arduino) for IoT smart building (L80-81); no Java |
| Agile / Git | Standard practice across all engagements |
| Strong CS fundamentals + eagerness to bridge software + physical world | IoT Smart Building (Arduino + DHT11 + DS3231 + PLX-DAQ logging + time-series forecasting, L80-81) — direct hardware + ML bridge |

**Gaps:**
1. **Manufacturing domain:** Not on CV. Energy Solutions oil & gas ERP is industrial-adjacent (compliance-sensitive enterprise systems) — frame as transferable. Hard blocker: probably no.
2. **Java:** Not on CV — minor; Python/C++ proficiency carries.
3. **F-1 OPT + Canada-based startup:** Maneva's offices are Toronto + Montreal with SF preference; if hire is Canadian-payroll, F-1 OPT can't accept (geo veto). If SF/US-payroll variant, viable. Verify in screen.

## C) Nivel y Estrategia

- JD: Junior — entry-level explicit (CS fundamentals + eagerness; no experience floor).
- Candidate: 2.5y Progress Solutions + Master's Kent State + YOLOv8 production ML + Manga Lens shipped product. Above the junior floor.
- Sell senior-without-lying: lead with shipped Chrome extension + 2.5y healthcare AI + YOLOv8 production work + IoT/hardware bridge. Position as "junior with production-AI bonus."
- If downleveled: it IS junior — accept if SF/US-payroll, comp aligned to junior CV/ML market ($90-130K).

## D) Comp y Demanda

| Source | Number | Notes |
|---|---|---|
| Glassdoor — Junior AI Engineer Toronto | CAD $65-85K | Canadian range |
| Levels.fyi — SF Junior CV/ML | $120K-$160K base | If SF-payroll variant |
| Glassdoor — Junior CV Engineer US | $95K-$140K | National median |
| Maneva careers page | Not disclosed | Comp opacity |

Manufacturing AI is a growing sub-segment (Tesla / FANUC / Siemens demand) but candidate-thin in entry tier. Demand band moderate; comp probably modest given junior + small startup + Canada base.

## E) Plan de Personalización

| # | Sección | Estado actual | Cambio propuesto | Por qué |
|---|---|---|---|---|
| 1 | Summary | Healthcare RAG + agentic ML | "Master's-graduating applied AI engineer with shipped production CV (YOLOv8) and multimodal vision systems; comfortable bridging software + physical world via Python/C++/IoT" | Maps to manufacturing CV + hardware bridge |
| 2 | Bullets | Healthcare-first | Front-load YOLOv8 Driver Drowsiness + Manga Lens (4 vision providers) + IoT Smart Building (sensor + ML) | Demonstrates CV + hardware + production work |
| 3 | Skills | Python-first | Surface YOLOv8 + OpenCV + ControlNet + OpenPose/MediaPipe + Docker MLOps | Maneva stack 1:1 |
| 4 | Projects | Healthcare-heavy | Re-order: YOLOv8 Drowsiness → Manga Lens → Agentic Pixel (CV/Diffusion) → IoT Smart Building | Front-load CV + hardware-adjacent |
| 5 | Cover letter | n/a | Open with "Manufacturing AI sits at the intersection of CV, MLOps, and hardware reality — the same surface I shipped YOLOv8 fatigue monitoring and IoT temperature prediction on" | Bridges CV + industrial systems |

## F) Plan de Entrevistas

| # | JD requirement | STAR+R |
|---|---|---|
| 1 | Train vision models (classification, detection, segmentation) | S: Driver fatigue detection needed real-time multi-class output; T: replace two-stage CNN bottleneck; A: unified YOLOv8 with LabelImg annotations + augmentation for lighting/head-pose + sliding-window confidence aggregation + adaptive frame skipping + NMS tuning; R: ~30% inference latency reduction + ~25% blink-driven false positive reduction; **Reflection:** detection-and-classification fusion beats two-stage on latency-critical edge inference — but only if augmentation covers the deployment distribution honestly |
| 2 | MLOps tooling setup + integration | S: Healthcare RAG + agentic pipelines needed reliable production endpoints; T: ship FastAPI/Flask services with monitoring; A: Docker + structured logging + load simulation + ~35% retrieval precision; R: ~30% defect reduction post-deploy; **Reflection:** the operational hygiene (logging, load tests, eval pipelines) is what separates "demo works" from "stays up at 3am" |
| 3 | Bridge software + physical world | S: Smart building thermal forecasting needed sensor → ML pipeline; T: ship working time-series forecaster; A: Arduino + DHT11 + DS3231 + PLX-DAQ logging + walk-forward validation comparing RF/SVR/Linear; R: Random Forest ~20-30% lower MAE; **Reflection:** sensor noise calibration (clock drift, temperature sensor lag) eats more days than the model — the data plumbing IS the ML problem |
| 4 | Multi-modal vision provider integration | S: Manga Lens needed multi-provider AI vision in browser; T: unified panel capture + 4-provider routing; A: Manifest V3 + service workers + Claude Sonnet + GPT-4o mini + GPT-4.1 Nano + Ollama/minicpm-v + per-provider payload (WebP cloud / JPEG Ollama to avoid CUDA crash); R: shipped to Chrome Web Store solo; **Reflection:** vendor-specific quirks (encoding, rate limits, latency tail) decide UX more than the model card |
| 5 | Cross-functional eagerness | S: Suvidha Foundation non-technical staff needed video summarization usable; T: deliver shippable system; A: Flask API + lightweight web UI + 60-70% review-time reduction; R: ~85% highlight alignment; **Reflection:** "junior with founder muscle" is the framing — I learn fast and ship end-to-end |

Red-flag prep:
- "Why are you applying to a junior role with 2.5y experience?" → Honest: Master's just finished May 2025; the early-career banner aligns with my graduation timeline. The 2.5y is bonus not seniority claim.
- "F-1 OPT?" → US-based; need US-payroll/SF entity. Confirm Maneva can hire on US-W2 via STEM extension before final.

## G) Posting Legitimacy

**Assessment:** Proceed with Caution

| Signal | Finding | Weight |
|---|---|---|
| Apply button | Active on Workable + ZipRecruiter + Built In Toronto + Glassdoor | Positive |
| Description quality | Medium — Workable JS-only render returned thin metadata; full content via Indeed/Hirify mirrors confirms specific tech (Python, Java, C++, vision tasks) and remote-first culture | Positive |
| Company | Ex-Google DeepMind founder; Built In Toronto profile; manufacturing AI niche; size unclear — likely seed/Series A | Neutral |
| Comp transparency | Not disclosed on JD — typical for early-stage Canada | Neutral |
| Reposting | Sibling roles ("AI Engineer", "Junior Software Engineer Full-Stack", "Junior SWE AI + Hardware Integration") active simultaneously — pattern suggests ongoing hiring not ghost posting | Positive |
| Layoffs / hiring freeze | None found | Positive |
| Geo legibility for F-1 OPT | Toronto/Montreal/SF preference — Canadian variants a hard block; SF variant viable | Concerning |

## H) Draft Application Answers

(Score 2.7 < 4.5 — H block omitted.)

---

## Keywords extraídas

Maneva, Junior AI Engineer, manufacturing AI, autonomous factory, computer vision, classification, object detection, segmentation, MLOps, Python, Java, C++, YOLO, vision models, remote-first, Toronto, Montreal, San Francisco.
