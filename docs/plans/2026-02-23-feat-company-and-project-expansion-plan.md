---
title: "feat: Expand company and project coverage with tiered model"
type: feat
status: completed
date: 2026-02-23
brainstorm: docs/brainstorms/2026-02-23-company-expansion-brainstorm.md
---

# feat: Expand Company and Project Coverage with Tiered Model

## Overview

Expand the dashboard from 36 to ~50+ public companies and 37 to ~43 projects. Introduces a `tier` field (`"direct"` vs `"upstream"`) to distinguish companies with specific project linkages from supply-chain-exposure-only plays. Data sourced from the Obsidian vault (88 company profiles, 272 sources) with web-verified financials.

## Problem Statement / Motivation

The dashboard tracks hyperscalers, GPU makers, and cooling/power vendors but has significant gaps in DC operators/REITs (Applied Digital, Equinix, Digital Realty), connectivity/fiber (Amphenol, Lumentum, Prysmian), and power/electrical distribution (Hubbell, Powell, Legrand, Oklo, NuScale). The Obsidian vault has deep, sourced research on 50+ additional companies. This expansion fills those gaps while adding a tiered model for upstream supply chain plays that lack project-specific linkages.

## Prior Art & Lessons Learned

The previous expansion (11→36 companies, 17→37 projects) documented three bugs:
1. **Orphaned companies** — 5 companies defined but never linked to projects, invisible in UI (`docs/solutions/ui-bugs/orphaned-entries-and-type-coercion-display-bugs.md`)
2. **Type coercion** — `pe_fwd:"N/M"` + `"x fwd"` → `"N/Mx fwd"` at 3 render locations
3. **Sign formatting** — negative growth with unconditional `+` prefix → `"+-3%"`

Prevention: bidirectional integrity check (proposed but never implemented), comprehensive type guards, pre-computed coordinate deconfliction.

---

## Implementation Phases

### Phase 1: Data Model Migration & Integrity Enhancement

**Goal:** Add `tier` field to all existing companies and implement bidirectional, tier-aware integrity check. Zero functional change — Companies View should render identically after this phase.

#### 1a. Add `tier: "direct"` to all 36 existing COMPANIES entries

`dc-data.js` — insert `tier:"direct"` as the first field in every entry, before `ticker`:

```javascript
VRT: { tier:"direct", ticker:"VRT", name:"Vertiv Holdings", ... },
```

Verify: `npm run dev` → Companies View renders identically. No visual diff.

#### 1b. Implement tier-aware bidirectional integrity check

`dc-data.js` lines 364-375 — enhance the existing forward check with three additional validations:

```javascript
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  const referencedTickers = new Set();
  // Forward: project → company
  PROJECTS.forEach(p => {
    p.companies.forEach(c => {
      if (!COMPANIES[c.ticker]) {
        console.error(`[dc-data] Project "${p.name}" (id:${p.id}) references unknown ticker "${c.ticker}"`);
      }
      referencedTickers.add(c.ticker);
    });
  });
  // Reverse: direct-tier company → project (must have links)
  Object.entries(COMPANIES).forEach(([ticker, co]) => {
    if (!co.tier) console.warn(`[dc-data] Company "${ticker}" missing tier field`);
    if (co.tier === "direct" && !referencedTickers.has(ticker)) {
      console.error(`[dc-data] Direct-tier company "${ticker}" (${co.name}) not referenced by any project`);
    }
    if (co.tier === "upstream" && referencedTickers.has(ticker)) {
      console.warn(`[dc-data] Upstream company "${ticker}" appears in project linkages — should it be tier:"direct"?`);
    }
  });
}
```

Verify: `npm run dev` → zero console errors/warnings.

#### 1c. Add type guards to financial display fields

`Data center dashboard.jsx` — audit all numeric interpolation points. Add `typeof === "number"` guards to these fields at all render locations (project detail sidebar, Companies View summary line, Companies View expanded grid):

- `op_margin`: `typeof co.op_margin==="number" ? co.op_margin+"%" : co.op_margin`
- `dc_pct`: same pattern
- `mcap`: `typeof co.mcap==="number" ? "$"+co.mcap+"B" : co.mcap`
- `fy26e_rev`: same pattern
- `fy26e_eps`: `typeof co.fy26e_eps==="number" ? "$"+co.fy26e_eps : co.fy26e_eps`

The existing guards for `pe_fwd` and `fy26e_growth` are already correct. This extends the pattern to all numeric fields that new companies (e.g., pre-revenue OKLO) may expose.

**Acceptance criteria (Phase 1):**
- [x] Every COMPANIES entry has `tier:"direct"` as first field
- [x] Integrity check validates: (a) every project ticker exists in COMPANIES, (b) every direct-tier company is referenced by ≥1 project, (c) no upstream company appears in project linkages, (d) every company has a `tier` field
- [x] All numeric display fields have type guards at all 3 render locations
- [x] `npm run dev` → zero console errors/warnings
- [x] Companies View renders identically to pre-change state

---

### Phase 2: Add New Companies

**Goal:** Add ~14-18 new COMPANIES entries using Obsidian vault research + web-verified financials.

#### 2a. Direct-tier companies (~10-14)

Read each company's Obsidian vault note for role, summary, and project context. Web-verify financial metrics (price, mcap, pe_fwd, fy26e_* fields). Follow existing field ordering exactly: `tier, ticker, name, price, mcap, pe_fwd, fy26e_rev, fy26e_eps, fy26e_growth, op_margin, dc_pct, lc_growth, backlog, color, role, summary`.

**DC Operators/REITs:**

| Ticker | Name | Vault File | Key Projects |
|--------|------|-----------|--------------|
| APLD | Applied Digital | `Companies/Applied Digital.md` | Polaris Forge 1 (existing id:34), Polaris Forge 2 (new), Delta Forge 1 (new) |
| EQIX | Equinix | `Companies/Equinix.md` | xScale Hampton (new) |
| DLR | Digital Realty | `Companies/Digital Realty.md` | Digital Dulles (new) |

**Connectivity & Fiber:**

| Ticker | Name | Vault File | Linkage Targets |
|--------|------|-----------|-----------------|
| APH | Amphenol | `Companies/Amphenol.md` | Projects with high-speed connector/cable needs |
| LITE | Lumentum | `Companies/Lumentum.md` | Projects alongside COHR (optical transceivers) |
| PRY | Prysmian | `Companies/Prysmian.md` | Projects with power cable/fiber infrastructure |

**Power & Electrical:**

| Ticker | Name | Vault File | Linkage Targets |
|--------|------|-----------|-----------------|
| HUBB | Hubbell | `Companies/Hubbell.md` | Projects with substation work |
| POWL | Powell Industries | `Companies/Powell Industries.md` | Projects with switchgear needs |
| LGRDY | Legrand | `Companies/Legrand.md` | Projects with PDU/busway needs |
| OKLO | Oklo | `Companies/Oklo.md` | Meta projects (1.2 GW deal), Equinix (500 MW deal) |
| SMR | NuScale Power | `Companies/NuScale Power.md` | Nuclear-adjacent projects if linkable |

**Additional:**

| Ticker | Name | Vault File | Linkage Targets |
|--------|------|-----------|-----------------|
| CLS | Celestica | `Companies/Celestica.md` | CoreWeave projects (switch integration) |
| STRL | Sterling Infrastructure | `Companies/Sterling Infrastructure.md` | Projects with site development work |
| FLEX | Flex Ltd | `Companies/Flex Ltd.md` | Projects with modular DC component needs |

**Color assignment:** Each new company needs a unique hex color distinguishable at alpha levels 15%, 18%, 22%, 33% against `#060a13`. Avoid hues already used by existing connectivity companies (GLW #f1c232, CIEN #45818e, LUMN #00b0f0, COHR #00bfff — note COHR and LUMN are already near-duplicates).

**Financial data notes:**
- OKLO: Pre-revenue. Use `pe_fwd:"N/M"`, negative `fy26e_eps`, potentially `"N/M"` for `op_margin` if negative and not meaningful. The Phase 1 type guards will handle these.
- SMR (NuScale): Also pre-revenue. Same pattern.
- EQIX/DLR: REITs — `pe_fwd` may not be meaningful; consider using FFO-based metrics or `"N/M"`.

#### 2b. Upstream-tier companies (~4+)

| Ticker | Name | Vault File | Rationale |
|--------|------|-----------|-----------|
| FCX | Freeport-McMoRan | `Companies/Freeport-McMoRan.md` | World's largest public copper producer; 27-33 tonnes copper/MW DC demand |
| NUE | Nucor | `Companies/Nucor.md` | #1 US steel producer; structural steel for DC construction |
| STLD | Steel Dynamics | `Companies/Steel Dynamics.md` | Steel supply chain beneficiary |
| CC | Chemours | `Companies/Chemours.md` | Opteon refrigerants; immersion cooling fluids |

These get `tier:"upstream"` and are NOT added to any project's `companies` array.

**Acceptance criteria (Phase 2):**
- [x] All new companies follow exact field ordering convention
- [x] Every direct-tier company is linkable to ≥1 project (linkages added in Phase 3)
- [x] Upstream companies have `tier:"upstream"` and appear in NO project `companies` arrays
- [x] All `pe_fwd` values are number or `"N/M"` — no other sentinel values
- [x] All hex colors tested at alpha 15/18/22/33% against #060a13
- [x] `npm run dev` → integrity check passes (upstream companies may warn until Phase 3 links direct companies to projects)

---

### Phase 3: Add New Projects & Update Existing Linkages

**Goal:** Add ~4-6 new projects and link new direct-tier companies to existing projects.

#### 3a. New projects

Sequential IDs starting at 38. Follow existing field order: `id, name, state, lat, lng, capacity, investment, status, year, type, operator, elecRate, companies`.

| ID | Name | State | Operator | Capacity | Status | Cluster Risk |
|----|------|-------|----------|----------|--------|--------------|
| 38 | Polaris Forge 2 | ND | Applied Digital | 1 GW | Under Construction | Low — ~103px from Polaris Forge 1 |
| 39 | Delta Forge 1 | TX/TBD | Applied Digital | 430 MW | Under Construction | Check vault for exact location |
| 40 | Equinix xScale Hampton | GA | Equinix | TBD | Under Construction | **Marginal** — ~27-29px from ATL/Union City |
| 41 | Digital Realty Digital Dulles | VA | Digital Realty | TBD | Under Construction | **COLLISION** — ~7px from Google VA; needs offset to ~(38.65, -77.10) |

**Coordinate deconfliction (pre-compute before coding):**
- **Georgia (id:40):** Real Hampton coords ~(33.37, -84.28). Adjust to ~(33.0, -83.8) to create visual triangle with ATL (33.75, -84.39) and Union City (33.35, -84.80).
- **Virginia (id:41):** Real Dulles coords ~(38.95, -77.45). Adjust to ~(38.65, -77.10) for ~35px separation from Google VA (39.04, -77.49) and ~35px from Mattermeade (38.15, -77.52).
- **North Dakota (id:38):** Real Harwood coords ~(46.88, -96.89). Safe at ~103px from Polaris Forge 1 (46.00, -98.52).

**Cap at 6-8 companies per project.** Follow company ordering: (1) Operator, (2) GPU/chip, (3) Cooling/power, (4) Construction, (5) Energy, (6) Networking.

#### 3b. Update existing projects with new company linkages

Add new direct-tier companies to existing projects where documented involvement exists:

| New Company | Existing Project(s) to Link | Role/Detail Source |
|-------------|----------------------------|-------------------|
| APLD | id:34 (Polaris Forge 1) | Developer & Operator — currently only in `operator` string |
| OKLO | Meta projects (id:8 Prometheus, id:9 Hyperion) | Nuclear microreactor partnership (1.2 GW deal) |
| LITE | Projects alongside COHR (id:32, id:33) | Optical transceivers (800G/1.6T laser chips) |
| CLS | CoreWeave projects (id:32, id:33) | Switch integration (41% 200G+ market share) |
| STRL | Projects with site development work | Civil construction and site development |

**For each linkage:** read the Obsidian vault company note and relevant source notes to write a factual `detail` string with specific metrics.

**Acceptance criteria (Phase 3):**
- [x] New project IDs are sequential (38+), no gaps
- [x] All coordinates produce valid SVG positions (0-960 x, 0-600 y) via `albersUsa()`
- [x] All marker pairs have ≥25px projected separation in cluster states
- [x] All capacity strings parseable by `parseMW()` regex: `/([\d.]+)\s*(GW|MW)/i`
- [x] Status values are one of the 4 canonical types
- [x] Every direct-tier company appears in ≥1 project's `companies` array
- [x] Company ordering within project arrays follows the 6-tier convention
- [x] `npm run dev` → zero console errors/warnings from integrity check

---

### Phase 4: UI Updates — Companies View Tiered Layout

**Goal:** Show upstream-tier companies in a separate section below direct-tier companies in Companies View.

#### 4a. Split Companies View rendering

`Data center dashboard.jsx` — modify the Companies View section (current lines 250-311) to render two groups:

```jsx
{/* Direct-tier companies — sorted by project count (existing logic) */}
<div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>
  Direct Project Involvement ({directCount})
</div>
{Object.entries(COMPANIES)
  .filter(([,co]) => co.tier === "direct")
  .sort((a,b) => (companyProjects[b[0]]||[]).length - (companyProjects[a[0]]||[]).length)
  .map(([ticker, co]) => {
    const projs = companyProjects[ticker] || [];
    if (projs.length === 0) return null;  // safety — integrity check should catch this
    // ... existing card rendering ...
  })}

{/* Tier separator */}
<div style={{borderTop:"1px solid #1e293b",margin:"8px 0",paddingTop:10}}>
  <div style={{fontSize:10,color:"#475569",textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>
    Supply Chain Exposure
  </div>
</div>

{/* Upstream-tier companies — sorted by market cap descending */}
{Object.entries(COMPANIES)
  .filter(([,co]) => co.tier === "upstream")
  .sort((a,b) => (typeof b[1].mcap==="number"?b[1].mcap:0) - (typeof a[1].mcap==="number"?a[1].mcap:0))
  .map(([ticker, co]) => {
    // Card with dimmer styling, no project count bar, no PROJECT INVOLVEMENT section
    // Expandable detail shows financial grid + summary only
  })}
```

#### 4b. Upstream card visual treatment

Upstream company cards differ from direct cards in:
- **No project count number or progress bar** — replace with supply chain category label
- **No "PROJECT INVOLVEMENT" section** when expanded — show financial grid + summary only
- **Dimmer styling** — slightly lower text opacity or muted border color to visually distinguish from direct companies

#### 4c. Header text update

Change Companies View header from "Company Exposure Across All Projects" to use section-specific headers (as shown in 4a).

**Acceptance criteria (Phase 4):**
- [x] Direct-tier companies render in top section sorted by project count (unchanged behavior)
- [x] Upstream-tier companies render below a "Supply Chain Exposure" divider sorted by market cap
- [x] Upstream cards have no project count bar
- [x] Upstream cards expand to show financial grid + summary (no project list)
- [x] Cross-navigation from direct company → map still works
- [x] The `if(projs.length===0) return null` filter still applies to direct-tier only (upstream uses different rendering path)
- [x] The `companyView` toggle button and filter buttons work unchanged

---

### Phase 5: Documentation

**Goal:** Update CLAUDE.md with new counts, tier field, and expanded conventions.

Update these sections:
- **Project Overview:** company/project counts
- **Architecture:** mention `tier` field in COMPANIES description
- **Data Structures:** add `tier` field to COMPANIES field list; document `"direct"` vs `"upstream"` semantics
- **Working with This Codebase:** add note about bidirectional integrity check; add ND to cluster states list; note upstream companies don't get project linkages
- **Key State Variables:** no changes needed (companyProjects memo handles upstream naturally)

**Acceptance criteria (Phase 5):**
- [x] CLAUDE.md reflects current company/project counts
- [x] `tier` field documented with semantics
- [x] Bidirectional integrity check documented
- [x] ND added to dense cluster states list

---

## Resolved Design Questions

From SpecFlow analysis — all resolved with defaults:

| Question | Resolution |
|----------|-----------|
| Integrity check tier-awareness | Implement all 3 checks: missing tier, orphaned direct, linked upstream |
| Delta Forge 1 location | Resolve from vault during Phase 3; defer if location unclear |
| Upstream company with project links | Warn in dev mode; render based on project count at runtime |
| Upstream sort order | Market cap descending |
| Upstream project count bar | Omit entirely; replace with supply chain label |
| Companies View header | Section-specific headers instead of single header |
| Northern Virginia deconfliction | Offset Digital Dulles to ~(38.65, -77.10) |
| Upstream card expandable detail | Yes — financial grid + summary, no project list |
| Additional type guards | Add to all numeric display fields (Phase 1c) |
| CLAUDE.md update | Yes, Phase 5 |

## Data Sourcing Workflow

For each new company:
1. Read Obsidian vault `Companies/{name}.md` for role, summary, project linkages
2. Read relevant `Sources/` notes for specific deal values, contract details
3. Cross-reference `Data Center Research/` notes for supply chain context
4. Web-verify financial metrics: price, mcap, pe_fwd, fy26e_rev, fy26e_eps, fy26e_growth, op_margin
5. Assign unique hex color; test at alpha levels against dark background
6. Write entry following exact field ordering convention

## References

- Previous expansion plan: `docs/plans/2026-02-22-feat-data-expansion-projects-and-vendors-plan.md`
- Orphaned entries solution: `docs/solutions/ui-bugs/orphaned-entries-and-type-coercion-display-bugs.md`
- Marker overlap solution: `docs/solutions/ui-bugs/map-markers-sizing-and-overlap.md`
- SVG projection solution: `docs/solutions/ui-bugs/svg-state-outlines-and-marker-legibility-fix.md`
- Brainstorm: `docs/brainstorms/2026-02-23-company-expansion-brainstorm.md`
