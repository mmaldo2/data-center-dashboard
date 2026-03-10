---
title: "Canonical research layer v1 for data center SSOT"
date: 2026-03-10
category: data-architecture
tags:
  - ssot
  - canonical-data
  - provenance
  - validation
  - dashboard-data
severity: medium
components:
  - "data/canonical"
  - "data/derived/dashboard-data.js"
  - "scripts/bootstrap-canonical-data.mjs"
  - "scripts/publish-canonical-data.mjs"
  - "Data center dashboard.jsx"
problem_type: "Evolve a curated dashboard dataset into a file-based source of truth with evidence-backed relationships and generated UI artifacts"
---

# Canonical Research Layer v1

## What changed

The dashboard no longer has to treat `dc-data.js` as the only meaningful data store.

Instead, the repo now has:

- a canonical file-based entity layer in `data/canonical/`
- a generated runtime layer in `data/derived/dashboard-data.js`
- scripts for bootstrapping from the legacy dataset and publishing validated runtime data
- UI surfaces that expose evidence volume and review status

## Canonical entities

The first-pass ontology is intentionally small:

- `companies` — public company master records and investability fields
- `projects` — canonical project records with both factual and display geography
- `project_company_links` — explicit relationship claims with role, confidence, and review status
- `sources` — source registry
- `evidence` — evidence records backing project-company links

This is the minimum useful SSOT for the current product scope: projects plus publicly traded firms tied to them.

## Storage choice

Storage is file-based JSON rather than a database.

Why:

- the repo is still a lightweight React/Vite project
- canonical entities can be diffed and reviewed in git
- analyst-led curation stays simple
- the publish step is deterministic

The workflow is:

1. `npm run data:bootstrap` to seed canonical JSON from the legacy dataset
2. analysts update `data/canonical/*.json`
3. `npm run data:publish` validates and emits `data/derived/dashboard-data.js`
4. the app imports the derived module

## Validation rules

The publish pipeline enforces the first reliability contract:

- only canonical status values are allowed
- every project must carry numeric capacity and display coordinates
- factual coordinates must either be present and reviewable or be left `null` with a non-verified coordinate review state
- every link must reference a known project and company
- every direct project-company link must cite at least one evidence record
- every evidence record must reference a known source
- every linked evidence record must match the same project and company as the relationship it supports
- confidence and review status are validated as explicit enums on links and evidence
- direct-tier companies must appear in at least one project link
- upstream-tier companies must not appear in direct project links

This keeps the old referential-integrity spirit but moves it into the canonical layer instead of leaving it as a UI-only safeguard.

## Confidence and review model

Confidence and review status now live on the relationship claim.

That is the right level because the question is not whether `Oracle` exists or whether `Stargate I — Abilene` exists. The question is whether a specific company is credibly tied to a specific project in a specific role.

Current bootstrap behavior:

- migrated links default to `confidence: "medium"`
- migrated links default to `review_status: "needs_review"`
- evidence text is preserved from the legacy dashboard detail field
- display coordinates are seeded from the legacy map dataset while factual coordinates remain `null` until reviewed

That gives the app immediate provenance while making the review debt explicit.

## Product evolution

The current UI changes are small on purpose:

- project detail now shows research coverage
- linked company cards show confidence, review status, and evidence count
- company view carries evidence counts and pending-review counts
- header copy reflects the canonical layer

The next product steps should be:

1. add search-first entity lookup
2. add project-level evidence timeline views
3. add company-level relationship history and source drill-down
4. add change-log and freshness views

The map stays as a discovery surface, not the data model.

## Milestone sequencing

### Milestone 1

Canonical research layer v1:

- file-based ontology
- publish pipeline
- validation rules
- evidence-backed runtime output
- minimal provenance UI

### Milestone 2

Analyst workflow hardening:

- richer source registry
- explicit source URLs
- verified / in-review / disputed states
- canonical editing guidelines

### Milestone 3

Terminal-style product surfaces:

- search-first navigation
- project pages
- company pages
- evidence drill-down
- recent changes feed

### Milestone 4

Scope expansion after the core is stable:

- private counterparties
- phase hierarchies
- power contracts and utilities
- permitting and financing entities

## Trade-off accepted

This version does not try to automate the whole world.

It optimizes for a better truth model first, because a clean ontology plus provenance is the prerequisite for the Bloomberg-terminal vision.
