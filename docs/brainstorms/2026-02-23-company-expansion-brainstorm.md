# Company & Project Expansion Brainstorm

**Date:** 2026-02-23
**Status:** Active

## What We're Building

Expand the dashboard's company coverage from 36 to ~50+ public companies and add ~4-6 new operator-anchored projects, using the Obsidian vault (88 company profiles, 39 research notes, 272 sources) as the primary research base. The goal is a more comprehensive picture of publicly traded companies involved in US AI data center infrastructure.

## Why This Approach

The dashboard currently tracks hyperscalers, GPU makers, cooling/power vendors, and construction firms — but has significant gaps in DC operators/REITs, connectivity/fiber, and power/electrical distribution. The Obsidian vault has deep, sourced research on 50+ additional companies that fills these gaps.

### Design Principles
- **Companies only matter if linked to projects** — every direct-tier company should appear in at least one project's `companies` array
- **Public companies only** — private companies (CoolIT, Crusoe, Compass, Kairos, Vantage) stay as project `operator` strings but don't get `COMPANIES` entries
- **Vault + web verification** — qualitative data (roles, summaries, project linkages) from Obsidian; financial metrics verified from current sources
- **Minimal UI changes** — add a `tier` field; upstream companies shown in a separate section in Companies View

## Key Decisions

### 1. Tiered Company Model

Add a `tier` field to every `COMPANIES` entry:
- **`"direct"`** — Company has documented involvement in specific tracked projects (linked via project `companies` arrays). All 36 existing companies are direct tier.
- **`"upstream"`** — Company benefits from DC buildout through supply chain exposure but isn't contracted to specific projects. Appears in Companies View only, with distinct visual treatment and no project linkages.

### 2. Priority Company Categories (Direct Tier)

**DC Operators/REITs:**
- APLD (Applied Digital) — already operates Polaris Forge 1 (id:34) but missing from COMPANIES
- EQIX (Equinix) — world's largest DC REIT; xScale JV, Oklo/Bloom partnerships
- DLR (Digital Realty) — DC REIT; Dulles expansion, Blackstone JV

**Connectivity & Fiber:**
- APH (Amphenol) — $178B mcap; IT Datacom 33% of sales; acquiring CommScope CCS ($10.5B); liquid cooling connectors
- LITE (Lumentum) — laser chips, optical transceivers for 800G/1.6T; stock +287% in 2025
- PRY (Prysmian) — world's largest cable manufacturer; acquired Encore Wire

**Power & Electrical:**
- HUBB (Hubbell) — double-digit DC organic growth; DMC Power acquisition ($825M)
- POWL (Powell Industries) — switchgear pure-play; ~20-30% DC revenue
- LGRDY (Legrand) — owns Server Technology, Raritan, Starline; ~26% group revenue from DC
- OKLO (Oklo) — microreactor design; 1.2 GW Meta deal, 500 MW Equinix deal
- SMR (NuScale Power) — only NRC-certified SMR; 6 GW TVA framework

**Additional High-Value:**
- CLS (Celestica) — 72-75% DC revenue; 41% market share in 200G+ switches
- STRL (Sterling Infrastructure) — site development; Q3 2025 DC revenues +125% YoY
- FLEX (Flex Ltd) — ~25% DC revenue; modular DC components, rack CDUs

### 3. Upstream Tier Companies (No Project Links)

Materials and supply chain exposure plays for Companies View:
- FCX (Freeport-McMoRan) — world's largest public copper producer; 27-33 tonnes copper/MW
- NUE (Nucor) — #1 US steel producer; structural steel for DC construction
- STLD (Steel Dynamics) — steel supply chain beneficiary
- CC (Chemours) — Opteon refrigerants and immersion cooling fluids
- Additional candidates from vault research (to be evaluated during planning)

### 4. New Projects (Operator-Anchored)

Projects to add that anchor the new DC operator companies:
- **Applied Digital Polaris Forge 2** — Harwood, ND; 1 GW potential; ~$5B
- **Applied Digital Delta Forge 1** — Southern US; 430 MW; broke ground Jan 2026
- **Equinix xScale Hampton** — Hampton, GA; first xScale US campus; GIC/CPP JV
- **Digital Realty Digital Dulles** — Northern Virginia; 7.5M sqft; $7B Blackstone JV

Additional projects may surface during vault cross-referencing in planning phase.

### 5. Existing Project Updates

Some new companies can be linked to existing projects:
- APLD added to Polaris Forge 1 (id:34) as Developer & Operator (currently only referenced as `operator` string)
- OKLO could link to Meta projects (Prometheus, Hyperion) via 1.2 GW partnership
- LITE could link alongside COHR on projects needing optical transceivers
- CLS could link to CoreWeave projects (switch integration)
- STRL could link to projects with site development work

### 6. Data Model Changes

```js
// Add tier field to COMPANIES
VRT: { tier: "direct", ticker: "VRT", ... },    // existing companies get "direct"
FCX: { tier: "upstream", ticker: "FCX", ... },   // new upstream companies

// No changes to PROJECTS structure
```

### 7. UI Changes (Minimal)

Companies View gets a visual separator:
- Direct-tier companies listed first (sorted by project count, as today)
- "Supply Chain Exposure" divider
- Upstream-tier companies listed below with dimmer styling and no project count/bar

No other UI changes in this pass.

## Data Sourcing Workflow

1. Read Obsidian vault company notes for: role, summary, project linkages, qualitative data
2. Read Obsidian vault research notes for: cross-references, supply chain context
3. Verify/update financial metrics (price, mcap, pe_fwd, fy26e_* fields) from web sources
4. Build entries following existing COMPANIES/PROJECTS conventions
5. Run dev-time integrity check to validate all linkages

## Open Questions

None — all key decisions resolved through dialogue.

## Estimated Scope

- ~14-18 new companies (10-14 direct, 4+ upstream)
- ~4-6 new projects
- ~20-30 new company-project linkages across existing projects
- `tier` field added to all ~50+ companies
- Minor Companies View UI update for upstream section
- `dc-data.js` grows from ~375 lines / ~54KB to ~550-600 lines / ~85-95KB
