# Data Expansion: More Projects & Publicly Traded Vendors

**Date:** 2026-02-22
**Status:** Brainstorm
**Source data:** `C:\Users\Marcus Maldonado\Downloads\dc_buildout_analysis.xlsx`

## What We're Building

Expand the dashboard from 17 projects and 11 companies to ~35-40 curated projects and ~31 companies. The Excel source provides 55 projects across all major hyperscalers (adding Google, CoreWeave), 31 ranked vendors, 13 energy PPAs, and hyperscaler capex data.

The goal is a more comprehensive picture of the US AI data center buildout and the public companies benefiting from it.

## Why This Approach

**Approach B: Extract data to separate file, then expand.**

- Move `COMPANIES` and `PROJECTS` from `Data center dashboard.jsx` into a dedicated `data.js` (or `dc-data.js`) file
- Expand the data there without bloating the rendering component
- Dashboard file stays focused on rendering (~300 lines vs. ~1000 if inline)
- Data file can be maintained independently and is easier to diff/review

Alternatives considered:
- **Inline expansion** — simplest but makes the single file unwieldy at ~1000 lines
- **Data + UI enhancements** — deferred to a separate effort to avoid scope creep

## Key Decisions

### Scope
- **Curated expansion:** ~35-40 projects (skip entries too incomplete to be useful), ~31 companies
- **Research missing data:** Use web search to fill gaps in capacity, investment, and location data rather than skipping or estimating
- **Status mapping:** Force-fit all Excel statuses to the existing 4 (Operational, Under Construction, Announced, Planned)
  - `Permitting` / `In development` / `Broke ground` -> Under Construction
  - `Paused/Redesign` -> Planned
  - `Partially operational` / `Operational + expanding` -> Operational
  - `Mixed` -> use dominant status or split into separate entries

### Companies to Add (~20 new)

**5+ project involvement filter** from Excel Vendor Summary:

| Ticker | Name | Category |
|--------|------|----------|
| ANET | Arista Networks | DC networking switches |
| AVGO | Broadcom | Custom AI chips, networking |
| PWR | Quanta Services | Electrical construction, grid |
| GLW | Corning | Fiber optic cable |
| FIX | Comfort Systems USA | HVAC/mechanical contractor |
| GEV | GE Vernova | Gas turbines, grid solutions |
| CEG | Constellation Energy | Nuclear power PPAs |
| CIEN | Ciena | Optical networking |
| EME | EMCOR Group | Electrical/mechanical contracting |
| BE | Bloom Energy | On-site fuel cells |
| LUMN | Lumen Technologies | Fiber connectivity |
| MRVL | Marvell Technology | Custom AI chips, networking |
| JCI | Johnson Controls | DC thermal management |
| CAT | Caterpillar | Backup generators, primary power |
| CMI | Cummins | Backup generators |
| ABB | ABB | Power distribution, UPS |
| AMD | AMD | GPUs, server CPUs |
| COHR | Coherent | Optical transceivers |
| TSLA | Tesla | Battery storage (Megapack) |
| NEE | NextEra Energy | Renewables/nuclear |
| OWL | Blue Owl Capital | Infrastructure financing |
| GOOGL | Alphabet/Google | Hyperscaler |
| CRWV | CoreWeave | GPU cloud / DC operator |

Plus existing 11: VRT, MOD, ETN, NVT, SMCI, SE (SBGSY), NVDA, ORCL, AMZN, META, MSFT

**Note:** Schneider Electric ticker in Excel is SBGSY (US ADR) vs. current SE.PA — should standardize.

### Hyperscaler Operators
- Add **GOOGL** (Google/Alphabet) and **CRWV** (CoreWeave) as COMPANIES entries with financial data
- Keep existing AMZN, META, MSFT, ORCL
- Apple stays as operator name only (small DC footprint)
- Private operators (QTS/Blackstone, Compass, CyrusOne, Vantage, Applied Digital) stay as operator names

### Energy PPAs
- Incorporated as project metadata: where a project has an associated PPA, add the energy provider as a linked company in that project's `companies` array
- Examples: CEG linked to Microsoft TMI project, VST linked to Meta Prometheus, GEV linked to Stargate Abilene
- No separate PPA view (deferred)

### Vendor-Project Linking
- Best-effort from Excel's "Key Vendors/Partners" column per project
- Supplement with web research for major projects
- For projects without explicit vendor data, infer from operator relationships and vendor categories (e.g., NVDA in every AI training project)

### Data File Structure
- New file: `dc-data.js` (or similar) exporting `COMPANIES` and `PROJECTS`
- Dashboard imports from this file instead of defining data inline
- Utility functions (`parseMW`, `statCol`, `capacityRadius`) stay in the dashboard file since they're rendering concerns

### Cluster Handling
States with many projects will need careful coordinate separation:
- **Texas:** Currently 2 projects, Excel adds ~5 more (Stargate Frontier, CoreWeave Plano, Anthropic TX, Haskell County, Bosque County, El Paso)
- **Virginia:** New cluster (Mattermeade, Louisa, Chesterfield, Loudoun/PW, Stafford, Digital Dulles)
- **Ohio:** Currently 2, adding Stargate Lordstown, Vantage New Albany
- **Wisconsin:** Already dense (4 projects), adding Fairwater Phase 1
- **Pennsylvania:** Currently 2, adding CoreWeave Lancaster, QTS/Blackstone, Salem/Falls AWS
- **Indiana:** Currently 1, adding Meta Lebanon, Meta Jeffersonville, Google Fort Wayne, Microsoft LaPorte
- **Georgia:** New cluster (Microsoft Fayetteville, Union City, Floyd County, Atlanta, Equinix Hampton)

## Resolved Questions

1. **Schneider Electric ticker:** Standardize on **SBGSY** (US ADR). Update the existing `SE` key and `SE.PA` ticker field to `SBGSY`.
2. **Multi-state projects:** **Split into individual entries.** CoreWeave/Core Scientific's 7-state portfolio becomes separate project entries at each major site for accurate map placement.
3. **Financial data sourcing:** **Research all new companies via web search** to populate the full financial field set (price, mcap, pe_fwd, fy26e_rev, fy26e_eps, growth, op_margin, dc_pct, lc_growth, backlog).
4. **DC REITs:** **Skip.** Equinix (EQIX) and Digital Realty (DLR) don't fit the vendor/partner model. The dashboard tracks builders and suppliers, not building owners.
