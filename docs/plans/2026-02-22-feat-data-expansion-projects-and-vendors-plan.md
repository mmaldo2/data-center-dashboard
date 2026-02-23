---
title: "feat: Expand dashboard data with curated projects and vendors"
type: feat
status: active
date: 2026-02-22
brainstorm: docs/brainstorms/2026-02-22-data-expansion-brainstorm.md
source_data: "C:\\Users\\Marcus Maldonado\\Downloads\\dc_buildout_analysis.xlsx"
---

# feat: Expand Dashboard Data with Curated Projects and Vendors

## Overview

Expand the dashboard from 17 projects / 11 companies to ~35-40 projects / ~31 companies using curated data from the `dc_buildout_analysis.xlsx` workbook. Extract all data into a separate `dc-data.js` file for maintainability. Research missing financial data via web search and carefully handle dense geographic clusters.

## Problem Statement / Motivation

The current dashboard covers only the most prominent AI data center projects. The Excel workbook identifies 55 projects across all major hyperscalers and independents (Google, CoreWeave, Applied Digital, etc.) and 31 publicly traded vendors. Expanding the data provides a more comprehensive investment landscape — showing which public companies benefit most from the DC buildout.

## Proposed Solution

**Three-phase approach:**
1. **Extract** — Move existing data to `dc-data.js`, rename SE→SBGSY, verify identical rendering
2. **Expand companies** — Add ~22 new company entries with researched financial data
3. **Expand projects** — Add ~18-23 curated project entries with geocoded coordinates and vendor linkages

## Technical Approach

### Architecture

```
Before:
  Data center dashboard.jsx (458 lines) — data + rendering
  states-geo-data.js — geographic data

After:
  dc-data.js — COMPANIES (~31 entries) + PROJECTS (~40 entries)
  Data center dashboard.jsx (~315 lines) — rendering only
  states-geo-data.js — geographic data (unchanged)
```

**`dc-data.js`** uses named exports following the `states-geo-data.js` pattern:
```javascript
export const COMPANIES = { ... };
export const PROJECTS = [ ... ];
```

**Dashboard** imports:
```javascript
import { COMPANIES, PROJECTS } from "./dc-data";
```

Utility functions (`parseMW`, `statCol`, `capacityRadius`, `albersUsa`, `ringToPath`, `geoToPath`, `STATE_PATHS`) remain in the dashboard file — they are rendering concerns.

### Implementation Phases

#### Phase 1: Extract Data + Rename SE → SBGSY

**Goal:** Identical dashboard rendering with data in a separate file.

**Tasks:**

- [x] Create `dc-data.js` at project root
- [x] Move `COMPANIES` object (lines 7-19 of dashboard) to `dc-data.js` as `export const COMPANIES`
- [x] Move `PROJECTS` array (lines 24-143 of dashboard) to `dc-data.js` as `export const PROJECTS`
- [x] Rename Schneider Electric: object key `SE` → `SBGSY`, ticker field `"SE.PA"` → `"SBGSY"`
- [x] Update all 5 project references from `ticker:"SE"` to `ticker:"SBGSY"` (projects 2, 5, 9, 10, 17)
- [x] Add import to dashboard: `import { COMPANIES, PROJECTS } from "./dc-data";`
- [x] Remove inline COMPANIES and PROJECTS definitions from dashboard
- [x] Add development-time ticker validation at end of `dc-data.js`:

```javascript
// Development-time referential integrity check
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  PROJECTS.forEach(p => {
    p.companies.forEach(c => {
      if (!COMPANIES[c.ticker]) {
        console.error(`[dc-data] Project "${p.name}" (id:${p.id}) references unknown ticker "${c.ticker}"`);
      }
    });
  });
}
```

- [ ] Verify: `npm run dev` renders identically. Check map markers, sidebar, company view, status filters, company detail expansion, and cross-navigation from company view to map.

**Success criteria:** Pixel-identical rendering. No console errors. All 17 projects clickable. All 11 companies expandable. SE ticker fully replaced with SBGSY.

---

#### Phase 2: Expand Companies (~22 new entries)

**Goal:** Add all vendors with 5+ project involvement, plus GOOGL and CRWV hyperscalers.

**New companies to add (23 total):**

| Ticker | Name | Category | Color (proposed) |
|--------|------|----------|-----------------|
| ANET | Arista Networks | DC networking | `#e06666` |
| AVGO | Broadcom | Custom AI chips, networking | `#cc0000` |
| PWR | Quanta Services | Electrical construction | `#e69138` |
| GLW | Corning | Fiber optic cable | `#f1c232` |
| FIX | Comfort Systems USA | HVAC/mechanical contractor | `#6aa84f` |
| GEV | GE Vernova | Gas turbines, grid | `#45818e` |
| CEG | Constellation Energy | Nuclear power PPAs | `#3c78d8` |
| CIEN | Ciena | Optical networking | `#674ea7` |
| EME | EMCOR Group | Electrical/mechanical contracting | `#a64d79` |
| BE | Bloom Energy | On-site fuel cells | `#85200c` |
| LUMN | Lumen Technologies | Fiber connectivity | `#1155cc` |
| MRVL | Marvell Technology | Custom AI chips | `#0b5394` |
| JCI | Johnson Controls | DC thermal management | `#38761d` |
| CAT | Caterpillar | Backup generators | `#bf9000` |
| CMI | Cummins | Backup generators | `#7f6000` |
| ABB | ABB | Power distribution, UPS | `#e11d48` |
| AMD | AMD | GPUs, server CPUs | `#ed1c24` |
| COHR | Coherent | Optical transceivers | `#20c997` |
| TSLA | Tesla | Battery storage (Megapack) | `#c8102e` |
| NEE | NextEra Energy | Renewables/nuclear | `#4ecdc4` |
| OWL | Blue Owl Capital | Infrastructure financing | `#2d3436` |
| GOOGL | Alphabet/Google | Hyperscaler | `#4285f4` |
| CRWV | CoreWeave | GPU cloud / DC operator | `#ff6b35` |

**Note on VST:** Vistra (VST) appears in the Energy PPAs sheet linked to Meta's nuclear PPA (2.1 GW). Since it will be referenced in the Prometheus project's `companies` array, **VST must be added as a COMPANIES entry** despite being below the 5+ threshold. Same applies to TLN (Talen Energy) if linked to any project. Total may reach 25 new companies.

**Tasks:**

- [x] Research current financial data for all new companies via web search. For each, populate: `price`, `mcap`, `pe_fwd`, `fy26e_rev`, `fy26e_eps`, `fy26e_growth`, `op_margin`, `dc_pct`, `lc_growth`, `backlog`, `role`, `summary`
- [x] Assign unique, distinguishable hex colors. Test at full opacity AND at alpha levels used in rendering (`${color}15`, `${color}18`, `${color}22`, `${color}33`) against the dark background (`#060a13`). Avoid colors too close to existing entries
- [x] Add entries to `COMPANIES` in `dc-data.js`
- [x] Use `"N/A"` for `lc_growth` where liquid cooling is not a relevant metric (hyperscalers, networking, fiber, energy providers)
- [x] Use `"N/A"` for `backlog` where not publicly disclosed; use specific values where available (e.g., RPO, deferred revenue)
- [ ] Verify: Companies View renders all new entries sorted by involvement count. Expand each to verify financial data renders correctly

**Success criteria:** All new companies render with correct colors, financial data, and summaries. No `undefined` values in UI. Colors are visually distinguishable.

---

#### Phase 3: Expand Projects (~18-23 new entries)

**Goal:** Add curated projects from the Excel workbook with geocoded coordinates, status mapping, and vendor linkages.

##### 3a. Curate the Project List

Select ~18-23 projects from the Excel's 55 entries. Prioritize:
- Projects with known capacity or investment data
- Major hyperscaler projects (Google, CoreWeave, Applied Digital)
- Projects that link to newly-added companies
- Geographic diversity (not just more Virginia projects)

**Proposed curated project list (subject to research findings):**

| # | Project | Operator | State | Status Mapping |
|---|---------|----------|-------|----------------|
| 18 | Fairwater Phase 1 | Microsoft | WI | Under Construction |
| 19 | Union City Campus | Microsoft/EdgeConneX | GA | Under Construction |
| 20 | Three Mile Island PPA | Microsoft/Constellation | PA | Under Construction |
| 21 | Mattermeade | Amazon/AWS | VA | Under Construction |
| 22 | Madison County | Amazon/AWS | MS | Under Construction |
| 23 | Salem/Falls Townships | Amazon/AWS | PA | Under Construction |
| 24 | Hermiston Campus | Amazon/AWS | OR | Operational |
| 25 | Stillwater | Google | OK | Under Construction |
| 26 | Council Bluffs expansion | Google | IA | Operational |
| 27 | Haskell County (Intersect) | Google | TX | Under Construction |
| 28 | Lebanon | Meta | IN | Under Construction |
| 29 | Montgomery | Meta | AL | Under Construction |
| 30 | Stargate Frontier | Oracle/Vantage | TX | Under Construction |
| 31 | Stargate Michigan | Oracle/OpenAI | MI | Under Construction |
| 32 | Stargate Lordstown | SoftBank | OH | Under Construction |
| 33 | CoreWeave NEST | CoreWeave | NJ | Under Construction |
| 34 | CoreWeave Denton TX | CoreWeave | TX | Operational |
| 35 | Polaris Forge 1 | Applied Digital | ND | Operational |
| 36 | Meridian Campus | Compass | MS | Under Construction |
| 37 | Bosque County | CyrusOne | TX | Under Construction |
| 38 | Virginia expansion | Google | VA | Under Construction |

**Status mapping rules:**
- `Under construction` / `Broke ground` / `Permitting` / `In development` / `Restart in progress` → **Under Construction**
- `Operational` / `Partially operational` / `Operational + expanding` → **Operational**
- `Announced` → **Announced**
- `Planned` / `Paused/Redesign` → **Planned**
- `Mixed` → Use the most advanced phase status (e.g., if any part is operational → **Operational**)

##### 3b. Research Missing Data

For each curated project, research via web search to fill:
- [x] **Capacity (MW):** Use published capacity or estimate from investment size
- [x] **Investment ($B):** From press releases or news articles
- [x] **Coordinates (lat/lng):** Geocode from city/county names. Use real coordinates as baseline
- [x] **Electricity rate (cents/kWh):** Use state average industrial rate from EIA as baseline; substitute PPA rate where publicly disclosed
- [x] **Completion year:** From press releases

##### 3c. Handle Dense Clusters

After geocoding, check each cluster for marker overlap. The Albers projection at scale 1070 maps roughly:
- 1 degree latitude ≈ 65-75 SVG pixels (varies by location)
- 1 degree longitude ≈ 50-60 SVG pixels (varies by latitude)

Minimum required separation: ~25px between marker centers (accommodates max radius 16px + 4px gap).

**Cluster coordination strategy:**

| State | Existing Projects | New Projects | Strategy |
|-------|-------------------|--------------|----------|
| TX | 2 (Abilene, Austin area) | ~4 (Shackelford, Haskell, Denton, Bosque) | Spread across state; real coords likely sufficient given TX size |
| WI | 4 (dense cluster) | 1 (Fairwater/Mt Pleasant) | Fairwater is same location as existing Microsoft Mount Pleasant — merge or offset by 0.3° |
| PA | 2 (Salem Twp, Homer City) | 2 (TMI, Salem/Falls AWS) | TMI near Middletown (40.5, -76.7), AWS near Berwick (41.0, -76.2) — offset if needed |
| OH | 2 (Stargate OH, Prometheus) | 1 (Lordstown, 41.17, -80.86) | Well separated from existing OH projects |
| VA | 0 | 2 (Mattermeade, expansion) | New cluster. Spread across NoVA corridor |
| IN | 1 (Rainier) | 1 (Lebanon, 40.05, -86.47) | Similar latitude to Rainier — offset by 0.4° lat |
| GA | 1 (ATL Superfactory) | 1 (Union City) | Union City ~10mi south of ATL — offset by 0.3° |
| MS | 0 | 2 (Madison County, Meridian) | Well separated geographically |

- [x] Compute SVG positions for all projects using `albersUsa(lng, lat)`
- [x] Identify pairs with <25px center-to-center distance
- [x] Apply coordinate offsets (±0.3-0.5° for light clusters, ±0.7-1.0° for dense)
- [x] Document adjusted coordinates with comments noting real vs. display coordinates

##### 3d. Link Vendors to Projects

For each new project:
- [x] Start with the Excel's "Key Vendors/Partners" column
- [x] Add the operator as a linked company if it's in COMPANIES (GOOGL, CRWV, AMZN, META, MSFT, ORCL)
- [x] Add energy providers where PPAs exist (CEG for TMI, GEV for Stargate Abilene already exists)
- [x] Research which tracked infrastructure vendors are involved (NVDA, VRT, ETN, ANET, etc.)
- [x] Write project-specific `role` and `detail` strings for each link
- [x] Cap at 6-8 linked companies per project for readability; prioritize the most significant relationships

**Company ordering within project `companies` arrays:**
1. Operator/developer (if public)
2. GPU/chip supplier (NVDA, AMD, AVGO)
3. Cooling/power infrastructure (VRT, MOD, ETN, NVT, SBGSY, JCI, ABB)
4. Construction (PWR, FIX, EME)
5. Energy provider (CEG, GEV, NEE, BE, VST)
6. Networking/connectivity (ANET, CIEN, GLW, LUMN, COHR, MRVL)

##### 3e. Add Projects to dc-data.js

- [x] Append new project entries to the `PROJECTS` array with sequential IDs starting at 18
- [x] Run ticker validation check — verify zero console errors
- [x] Verify all new markers appear on map at expected positions
- [x] Test status filters — each should show a reasonable subset
- [x] Test clicking each new marker — sidebar detail should show correctly
- [x] Test each new project's linked companies — financial data should render

**Success criteria:** All new projects render on map without overlap. Every project is clickable. Every linked company card renders complete data. Status filters work correctly. Company View reflects updated involvement counts.

---

#### Phase 4: Update CLAUDE.md

- [x] Update project count (17 → 37)
- [x] Update company count (11 → 36)
- [x] Add `dc-data.js` to architecture section
- [x] Update "Data center dashboard.jsx" description — data is now imported, not inline
- [x] Rename "Inline Data Structures" section to "Data Structures" and reference `dc-data.js`
- [x] Update line count estimate for dashboard file
- [x] Add note about ticker validation check in development mode
- [x] Document the status mapping rules
- [x] Update cluster states list (add VA, GA, IN, MS, etc.)

## Acceptance Criteria

### Functional Requirements

- [ ] Dashboard renders ~35-40 project markers on the map
- [ ] All ~31 companies appear in Companies View with correct financial data
- [ ] Clicking any project marker shows its detail with linked companies
- [ ] Expanding any company card shows complete financial data (no `undefined` values)
- [ ] Status filters correctly filter the expanded project set
- [ ] Cross-navigation from Company View to Map works for all projects
- [ ] Energy providers (CEG, VST, GEV, NEE, BE) appear as linked companies in relevant projects
- [ ] Schneider Electric renders as SBGSY throughout

### Data Integrity

- [ ] Zero console errors from ticker validation check
- [ ] Every ticker in every project's `companies` array resolves in `COMPANIES`
- [ ] No duplicate project IDs
- [ ] All project coordinates produce valid SVG positions (within 0-960 x, 0-600 y)
- [ ] All capacity strings parseable by `parseMW()` regex

### Visual Quality

- [ ] No overlapping markers that prevent clicking
- [ ] All 31 company colors visually distinguishable at badge alpha levels
- [ ] Capacity labels don't collide with adjacent markers in clusters
- [ ] Map remains readable with all status filters set to "All"

## Dependencies & Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Ticker typo causing broken card | High | Critical | Dev-time validation check logs errors |
| Marker overlap in dense clusters | High | Important | Pre-compute SVG positions, manual coordinate offsets |
| Stale financial data | Medium | Low | Document data vintage in comments |
| Color similarity at low alpha | Medium | Important | Test all colors at 15% opacity on dark background |
| Missing capacity data after research | Low | Low | Use `parseMW()` default (500 MW) as fallback |

## References & Research

### Internal References
- Brainstorm: `docs/brainstorms/2026-02-22-data-expansion-brainstorm.md`
- Marker overlap solution: `docs/solutions/ui-bugs/map-markers-sizing-and-overlap.md`
- SVG rendering solution: `docs/solutions/ui-bugs/svg-state-outlines-and-marker-legibility-fix.md`
- Data model pattern: `states-geo-data.js` (named export convention)
- Dashboard rendering: `Data center dashboard.jsx:187-457` (component function)
- SE ticker locations: lines 13, 38, 58, 88, 95, 140 in dashboard file

### Source Data
- Excel workbook: `dc_buildout_analysis.xlsx` — Projects (55 rows), Vendor Summary (31 rows), Energy PPAs (13 rows), Hyperscaler Capex (6 rows)
- FracTracker CSV: `Copy of Data_Centers_Database - FracTracker Data Centers.csv` (~1,358 rows, not consumed)
