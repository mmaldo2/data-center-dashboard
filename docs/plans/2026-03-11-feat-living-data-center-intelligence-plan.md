# Living Data Center Intelligence Plan ("Mini Bloomberg Terminal")

## Objective
Build a continuously updated, evidence-backed intelligence layer for U.S. data center development that tracks **publicly traded companies** participating as operators, partners, vendors, utilities, financiers, and enabling suppliers.

The target outcome is a dashboard that answers, in near-real time:
- What projects are being announced, funded, delayed, constructed, energized, and expanded?
- Which public companies are economically exposed, and how directly?
- What changed this week versus prior expectations?

## Product Definition: "Living Representation of Reality"
A living representation means:
1. **Event-driven updates** (not periodic static snapshots only).
2. **Source traceability** for each fact (SEC filing, press release, utility filing, permitting docket, earnings transcript, etc.).
3. **Time-aware truth** (effective date + reported date + first-seen date).
4. **Confidence and freshness scoring** surfaced in the UI.
5. **Explicit uncertainty** where data is estimated or incomplete.

## Coverage Model

### 1) Company Universe (Public Companies Only)
Create a maintained watchlist of listed companies grouped by economic role in data center buildout.

- **Project operators / hyperscalers**
- **Colocation / REIT developers**
- **Compute + silicon vendors**
- **Power + electrical infrastructure vendors**
- **Thermal / cooling vendors**
- **Construction, EPC, and engineering firms**
- **Utilities and power generation partners**
- **Fiber / networking / interconnect providers**
- **Land, civil, and modular infrastructure suppliers**

Each company gets:
- Ticker, exchange, country, market cap bucket.
- Role taxonomy (primary + secondary).
- Exposure type: direct project linkage, contracted vendor, supply-chain/upstream, strategic partner.
- Linkage confidence and evidence count.

### 2) Project Universe (U.S. First)
Track projects across lifecycle states:
- Site identified
- Permitting / interconnection queue
- Financing secured
- Groundbreaking
- Under construction
- Phase energization / partial operations
- Fully operational
- Expansion announced
- Paused / delayed / canceled

For each project, model:
- Geographic details (state/county/city, lat/lng).
- Capacity trajectory (announced, under construction, energized MW/GW).
- Power source mix and utility relationship.
- Capital commitment (range + revision history).
- Known participants (company-role links).
- Milestone history with dates and sources.

## Data Architecture Enhancements

## 1) Canonical Entity Expansion
Extend the canonical layer beyond current core entities:
- `companies`
- `projects`
- `company_project_links`
- `evidence`
- `sources`

Add:
- `events` (append-only, milestone-level truth)
- `facilities` (optional sub-entity for campuses with multiple buildings/phases)
- `project_snapshots` (derived latest state for fast dashboard rendering)
- `company_exposure_metrics` (derived, point-in-time metrics)
- `taxonomy` (normalized roles, statuses, event types)

## 2) Event-Sourced Data Strategy
Treat each new filing or announcement as an **event**, not an overwrite.

Event fields:
- `event_type` (e.g., capacity_revised, PPA_signed, permit_approved, construction_started)
- `project_id`, `company_ids`
- `effective_date`, `reported_date`, `ingested_at`
- `delta_payload` (what changed)
- `evidence_ids`
- `confidence_score`

This enables:
- Timeline views.
- "What changed since last week" summaries.
- Backtesting and error correction.

## 3) Fact Confidence + Freshness
For every high-value field (capacity, capex, stage, partner linkage):
- `confidence`: High / Medium / Low
- `freshness_days`
- `last_verified_at`
- `verification_source_type` (primary filing, transcript, media, inferred)

UI should visually distinguish:
- Confirmed facts vs inferred estimates.
- Fresh data vs stale data.

## Source Ingestion Strategy

## 1) Source Priority Tiers

**Tier 1 (highest trust):**
- SEC filings (10-K, 10-Q, 8-K, S-1 where relevant)
- Company press releases / IR pages
- Earnings call transcripts
- Utility commission and interconnection filings
- Local/state permitting records

**Tier 2:**
- Credible trade press and infrastructure publications
- Datacenter operator blogs / engineering updates

**Tier 3:**
- Secondary media aggregation and analyst commentary

Rules:
- Material project/company facts should require Tier 1 or two independent Tier 2 sources.
- Track provenance per claim, not just per project.

## 2) Ingestion Pipeline (Practical)
1. **Collect**: periodic scrapers + manual analyst intake.
2. **Normalize**: parse into structured events.
3. **Resolve entities**: map company aliases, project aliases, location disambiguation.
4. **Validate**: schema checks + contradiction checks.
5. **Publish**: regenerate derived dashboard dataset.
6. **Audit**: emit change log and confidence deltas.

## 3) Contradiction and Reconciliation Logic
When sources disagree:
- Preserve both claims as separate evidence-backed facts.
- Promote latest high-confidence claim to active snapshot.
- Attach `supersedes` relationships for auditability.
- Flag material conflicts for human review queue.

## Metrics That Make It Terminal-Like

### Project Intelligence
- Total announced MW/GW (U.S., by region/state).
- Under-construction MW and energization progress.
- Average development cycle time by operator.
- Delay/cancellation rates by project class.
- Utility concentration and grid region dependency.

### Company Intelligence
- Company exposure score = weighted sum of project-stage-adjusted involvement.
- Confirmed vs speculative exposure breakdown.
- Exposure by role segment (power, cooling, compute, construction, etc.).
- Momentum indicators: new projects linked, pipeline growth, revisions.
- Concentration risk (top-project dependence).

### Market Monitoring
- Weekly "new/changed/at-risk" dashboard.
- State leaderboard by committed and energized capacity.
- Vendor league tables by linked MW and project count.

## UX Additions for Decision Usefulness
1. **Change feed panel** (last 7/30/90 days).
2. **Evidence drawer** for every key fact.
3. **Confidence overlays** on map markers and company cards.
4. **Project lifecycle timeline** widget.
5. **Compare companies** mode (role, exposure, momentum).
6. **Saved watchlists** (by ticker, state, project stage).

## Data Quality Operating Model

### Automated checks (CI)
- Schema validation for canonical entities.
- Required-source enforcement for critical fields.
- Link integrity checks (company↔project↔event↔evidence).
- Duplicate detection (same event represented twice).
- Staleness alerting for unverified high-impact records.

### Human QA cadence
- Weekly triage of low-confidence or conflicting items.
- Monthly deep refresh for top 25 most impactful projects.
- Quarterly taxonomy and role-model review.

## Implementation Roadmap

### Phase 1 — Foundation (2–3 weeks)
- Finalize expanded schema (`events`, `snapshots`, `taxonomy`).
- Add confidence/freshness fields.
- Build changelog generation in publish pipeline.
- Add CI tests for lineage and contradiction rules.

### Phase 2 — Coverage Expansion (3–5 weeks)
- Expand public-company watchlist by role taxonomy.
- Backfill top U.S. projects with event histories.
- Add source tiering and claim-level provenance.

### Phase 3 — Terminal Features (3–4 weeks)
- Implement change feed, evidence drawer, lifecycle timelines.
- Add company comparison and exposure analytics.
- Add filters for confidence and recency.

### Phase 4 — Ongoing Intelligence Ops (continuous)
- Weekly ingestion + QA cycle.
- Monthly KPI review (coverage, lag, confidence mix).
- Continuous refinement of supplier-partner graph.

## Success Criteria (90-Day)
- >=90% of tracked projects have at least one Tier 1 source in past 60 days.
- >=95% of direct company-project links have explicit evidence.
- Median update lag from material announcement to dashboard <72 hours.
- >=80% of key project fields carry High/Medium confidence with visible provenance.
- Weekly change digest generated automatically with zero manual formatting.

## Immediate Next Steps
1. Approve taxonomy for roles, statuses, and event types.
2. Implement schema additions in canonical data files and scripts.
3. Pilot event ingestion on top 10 highest-visibility U.S. projects.
4. Add UI surfacing for confidence and "last updated" at project/company level.
5. Define analyst workflow for disputed claims and manual overrides.
