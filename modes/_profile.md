# User Profile Context -- career-ops

<!-- ============================================================
     THIS FILE IS YOURS. It will NEVER be auto-updated.
     
     Customize everything here: your archetypes, narrative,
     proof points, negotiation scripts, location policy.
     
     The system reads _shared.md (updatable) first, then this
     file (your overrides). Your customizations always win.
     ============================================================ -->

## Your Target Roles

14 years of experience in real estate firms as a full-stack data professional.
Targeting US remote data roles at real estate and property management companies.

| Archetype | Thematic axes | What they buy |
|-----------|---------------|---------------|
| **Senior / Staff Data Engineer** | Pipelines, warehouses, dbt, Snowflake/Databricks, data platform | Someone who builds and owns the data infrastructure end-to-end |
| **Analytics Engineer** | dbt, Snowflake, semantic layer, BI, data modeling | Someone who bridges raw data and business insight |
| **Data Scientist / ML Engineer** | Pricing models, AVM, risk scoring, demand forecasting | Someone who builds RE-specific predictive models with production experience |
| **BI / Insights Engineer** | Dashboards, Tableau/Looker/Power BI, reporting, KPIs | Someone who turns data into decisions for RE operations |
| **Data / Analytics Manager** | Team leadership, data strategy, stakeholder alignment | A senior IC who can also grow a team |
| **Full Stack Data Engineer** | End-to-end: ingestion → transformation → serving → BI | A rare generalist who owns the entire data stack |

## Your Adaptive Framing

| If the role is... | Emphasize about you... | Proof point sources |
|-------------------|------------------------|---------------------|
| Data Engineering | Pipeline reliability, data platform ownership, RE domain depth | cv.md + article-digest.md |
| Analytics Engineering | dbt modeling, semantic layer, BI delivery, stakeholder impact | cv.md + article-digest.md |
| Data Science / ML | RE pricing models, AVM, forecasting, production ML at scale | cv.md + article-digest.md |
| BI / Reporting | Dashboard design, KPI definition, self-serve analytics adoption | cv.md + article-digest.md |
| Full Stack / Platform | Ownership from ingestion to BI, breadth across the stack | cv.md + article-digest.md |
| Leadership / Manager | Hiring, mentoring, data strategy, cross-functional alignment | cv.md |

## Your RE Domain Advantage

**This is your moat.** Most data engineers and scientists have no real estate context.
You have 14 years of it. Always surface domain knowledge explicitly in evaluations:

- Property valuation and AVM logic (how Zestimates, HouseCanary AVMs work)
- Lease lifecycle data (listing → showing → application → lease → renewal → churn)
- Portfolio analytics (occupancy rates, NOI, cap rates, rent rolls)
- Market data nuances (MLS feeds, CoStar/ATTOM data quality issues, dedup)
- Maintenance and ops data (work orders, vendor SLAs, turn costs)
- Mortgage pipeline data (origination, servicing, delinquency, prepayment)

When a JD mentions any of these — cite it as a direct match. Most candidates won't know what a rent roll is.

## Scoring Overrides

### Green Card / US Work Authorization Boost

**RULE: When a job posting explicitly states "Green Card or US Citizen only", "No sponsorship", "Must be authorized to work in the US without sponsorship", or equivalent language — add +0.4 to the final Global score (capped at 5.0).**

**Why:** These roles exclude the majority of highly qualified candidates (H1B holders, OPT, TN). As a green card holder or citizen, you face significantly less competition. The effective talent pool shrinks by 30-50%+, meaningfully improving your odds of reaching the interview stage.

**How to surface this in reports:**
- Note it explicitly in Block D (Cultural signals) or as a standalone callout:
  > ✅ **Work Auth Advantage:** Role requires GC/Citizen only. Candidate qualifies; estimated 30-50% fewer competing applicants.
- Add the +0.4 in the Global score calculation and annotate it:
  > Global: 3.8 → **4.2** (+0.4 work auth advantage)

**Signals to detect (case-insensitive, partial match):**
- "green card" + ("only" OR "required" OR "holders")
- "US citizen" + ("only" OR "required")
- "must be authorized to work" + ("without sponsorship" OR "no sponsorship")
- "no visa sponsorship" OR "cannot sponsor" OR "sponsorship not available"
- "US persons only" (common in defense/government-adjacent roles)
- "must have existing authorization"

**Do NOT apply this boost if:**
- The JD says "we welcome all work authorizations" or similar
- Sponsorship is mentioned but only for future GC (many companies sponsor GC for H1B holders — that's a different signal)
- The JD is silent on sponsorship (neutral — no boost, no penalty)

### Remote-Only Boost

**RULE: Roles listed as "100% remote" or "fully remote" with no travel requirement get +0.2 to Global score.**

**Why:** You are targeting US remote only. Fully remote removes relocation pressure, maximizes optionality, and fits your work style.

**Do NOT apply if:**
- Role says "remote-friendly" but expects quarterly travel or onsite sprints
- Role is remote only for a specific geography you're not in

### Real Estate Domain Boost

**RULE: When the company is a real estate firm, PropTech, property management SaaS, or RE data platform — add +0.3 to Block A (Match con CV) before the Global calculation.**

**Why:** Your 14 years of RE domain experience is directly transferable and rare. Generic tech companies don't get this boost.

## Your Comp Targets

Use WebSearch for current market data (Levels.fyi, Glassdoor, Blind, Comprehensive.io).
Anchor by title and years of experience (14 YOE).

**General guidance:**
- Senior Data Engineer (US remote): $150k–$200k base + equity
- Staff Data Engineer: $180k–$240k base + equity
- Analytics Engineer (Senior): $140k–$185k base
- Data Scientist (Senior): $155k–$210k base + equity
- BI Engineer / Analytics Manager: $130k–$180k base

## Your Negotiation Scripts

**Salary expectations:**
> "Based on current market data for senior data roles in real estate tech, I'm targeting $[RANGE]. I'm open on structure — base, equity, and bonus all matter. What's the range budgeted for this level?"

**On domain depth:**
> "14 years in RE data is unusual — most data engineers have to learn the domain on the job. I've already built the muscle: MLS feeds, AVM validation, lease lifecycle modeling, portfolio analytics. That ramp-up cost is zero for you."

**Geographic discount pushback:**
> "The work is fully remote and output-based. My track record doesn't change based on where my desk is."

**When offered below target:**
> "I'm comparing this with other opportunities in the $[higher range]. I'm drawn to [company] specifically because of [concrete reason]. Can we get to $[target] on base, or explore equity/bonus to close the gap?"

## Your Location Policy

- **Target:** US remote only. No relocation. No hybrid outside your metro.
- **Timezone:** Flexible across US timezones (flag in applications if ET/CT/MT/PT overlap matters).

**In evaluations (scoring):**
- Hybrid required (3+ days onsite): score **2.0** on Cultural signals, note as near-dealbreaker
- Travel required >20%: score **2.5**, flag explicitly
- "Remote with occasional travel" (1-2x/year): acceptable, score **4.0**
- Fully remote, no travel: score **5.0**, apply Remote-Only Boost (+0.2)
- Only score 1.0 if JD says "must be on-site 4-5 days/week, no exceptions"
