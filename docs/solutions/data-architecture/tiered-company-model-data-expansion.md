---
title: "Company and project data expansion with tiered model, integrity checks, and type-safe rendering"
date: 2026-02-23
category: data-architecture
tags:
  - data-expansion
  - tiered-model
  - referential-integrity
  - type-safety
  - bidirectional-validation
  - company-project-linkage
  - upstream-supply-chain
  - coordinate-deconfliction
  - financial-data-formatting
severity: medium
components:
  - "dc-data.js"
  - "Data center dashboard.jsx"
  - "CLAUDE.md"
problem_type: "Multi-phase data model expansion with preventive integrity enforcement and UI rendering adaptation"
resolution_time: "~4-6 hours (5 phases)"
---

# Company and Project Data Expansion with Tiered Model

## Problem Statement

The AI Data Center Investment Map dashboard needed to expand from 36 companies and 37 projects to 54 companies and 41 projects, while simultaneously addressing structural weaknesses exposed by a prior expansion (PR #4) that produced three bugs:

1. **Orphaned companies** -- 5 companies (AMD, AVGO, JCI, TSLA, COHR) defined in `COMPANIES` but never linked to any project, invisible in the UI because Companies View filtered them with `if(projs.length===0) return null`.
2. **Type coercion** -- `pe_fwd:"N/M"` concatenated with `"x fwd"` produced `"N/Mx fwd"` at 3 render locations.
3. **Sign formatting** -- negative `fy26e_growth:-3` with unconditional `+` prefix produced `"+-3%"`.

The expansion introduced a **tiered company model** (`"direct"` vs `"upstream"`) to accommodate two distinct classes: companies with documented project involvement (50 direct-tier) and supply-chain-exposure-only plays (4 upstream-tier: FCX, NUE, STLD, CC). This required changes across the data model, integrity validation, rendering logic, and documentation.

Coverage gaps filled: DC operators/REITs (APLD, EQIX, DLR), connectivity/fiber (APH, LITE, PRY), power/electrical (HUBB, POWL, LGRDY), nuclear energy (OKLO, SMR), IT infrastructure (CLS, STRL, FLEX).

---

## Solution

### 1. Tiered Company Model

A `tier` discriminant field was added as the first property of every `COMPANIES` entry:

- `tier:"direct"` -- company appears in at least one project's `companies` array; rendered in "Direct Project Involvement" section, sorted by project count.
- `tier:"upstream"` -- company has no project linkages; rendered in "Supply Chain Exposure" section, sorted by market cap.

```javascript
// dc-data.js
VRT: { tier:"direct", ticker:"VRT", name:"Vertiv Holdings", price:240.60, mcap:92.9, ... },
FCX: { tier:"upstream", ticker:"FCX", name:"Freeport-McMoRan", price:65.00, mcap:93.4, ... },
```

**Why this pattern:** The previous expansion's orphaned companies bug showed that companies added without project linkages become invisible. The tier field explicitly declares whether a company requires linkages, allowing the integrity check to enforce the invariant and the UI to render upstream companies in a dedicated section.

### 2. Bidirectional Integrity Check

The forward-only validator was replaced with a bidirectional, tier-aware check running in dev mode:

```javascript
// dc-data.js (lines 436-457)
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  const referencedTickers = new Set();
  // Forward: project -> company
  PROJECTS.forEach(p => {
    p.companies.forEach(c => {
      if (!COMPANIES[c.ticker]) {
        console.error(`[dc-data] Project "${p.name}" (id:${p.id}) references unknown ticker "${c.ticker}"`);
      }
      referencedTickers.add(c.ticker);
    });
  });
  // Reverse: validate tier field and linkage consistency
  Object.entries(COMPANIES).forEach(([ticker, co]) => {
    if (!co.tier) console.warn(`[dc-data] Company "${ticker}" missing tier field`);
    if (co.tier === "direct" && !referencedTickers.has(ticker)) {
      console.error(`[dc-data] Direct-tier company "${ticker}" (${co.name}) not referenced by any project`);
    }
    if (co.tier === "upstream" && referencedTickers.has(ticker)) {
      console.warn(`[dc-data] Upstream company "${ticker}" appears in project linkages`);
    }
  });
}
```

Four validation rules: (1) forward reference validity, (2) direct-tier orphan detection, (3) upstream-tier linkage mismatch, (4) missing tier field.

### 3. Type-Safe Formatting Helpers

Five pure functions replace 15+ inline `typeof` guards across 4 render locations:

```javascript
// Data center dashboard.jsx (lines 46-50)
const fmtB = v => typeof v === "number" ? `$${v}B` : v;
const fmtPct = v => typeof v === "number" ? `${v}%` : v;
const fmtGrowth = v => typeof v === "number" ? `${v>=0?"+":""}${v}%` : v;
const fmtPE = v => typeof v === "number" ? `${v}x` : "N/M";
const fmtEPS = v => typeof v === "number" ? `$${v}` : v;
```

Each helper follows the same contract: if the value is a `number`, format with the appropriate unit; if it's a string sentinel (`"N/A"`, `"N/M"`), pass through unchanged. `fmtGrowth` additionally handles sign formatting, preventing the `"+-3%"` bug.

### 4. Performance Optimization

Four `useMemo` hooks eliminate redundant computation on hover-triggered re-renders, plus `S` style helper hoisted to module scope:

```javascript
// Data center dashboard.jsx
const project = useMemo(() => sel ? PROJECTS.find(p=>p.id===sel) : null, [sel]);
const linkedCompanies = useMemo(() =>
  project ? project.companies.map(c=>({...COMPANIES[c.ticker],...c})) : [], [project]);

const directCompanies = useMemo(() =>
  Object.entries(COMPANIES).filter(([,co])=>co.tier==="direct")
    .sort((a,b)=>(companyProjects[b[0]]||[]).length-(companyProjects[a[0]]||[]).length),
  [companyProjects]);

const upstreamCompanies = useMemo(() =>
  Object.entries(COMPANIES).filter(([,co])=>co.tier==="upstream")
    .sort((a,b)=>(typeof b[1].mcap==="number"?b[1].mcap:0)-(typeof a[1].mcap==="number"?a[1].mcap:0)),
  []);
```

### 5. Phased Implementation

| Phase | Goal | Risk Mitigated |
|-------|------|----------------|
| 1. Data Model Migration | Add `tier` field, bidirectional check, type guards | Guardrails established before any new data |
| 2. Add Companies | 14 direct + 4 upstream from Obsidian vault | Integrity check catches orphans immediately |
| 3. Add Projects & Linkages | 4 new projects, link companies to 12 existing | Coordinate deconfliction pre-computed |
| 4. UI Updates | Tiered Companies View | Separated from data -- if rendering breaks, data is known-good |
| 5. Documentation | Update CLAUDE.md | Final phase ensures docs match implementation |

---

## Prevention & Best Practices

### Data Expansion Checklist

**Before writing code:**

- [ ] Confirm each new company has a unique ticker not colliding with existing `COMPANIES` keys
- [ ] Decide `tier` for each new company: `"direct"` (linked to projects) or `"upstream"` (supply chain only)
- [ ] For every `tier:"direct"` company, identify at least one project it will be linked to
- [ ] For every new project, draft the full `companies` array following the 6-tier ordering convention

**While writing data:**

- [ ] Use sequential unique `id` values for projects
- [ ] Use real `lat`/`lng` coordinates; check dense clusters (OH, WI, PA, TX, IN, GA, VA, ND) for 25px minimum marker separation
- [ ] Use only canonical `status` values: `"Operational"`, `"Under Construction"`, `"Announced"`, `"Planned"`
- [ ] Use `"N/A"` for irrelevant metrics, `"N/M"` for not-meaningful (e.g., negative-earnings P/E, REIT P/E)
- [ ] Choose visually distinct `color` hex values tested at badge alpha levels

**After writing data:**

- [ ] `npm run dev` → zero `[dc-data]` console errors/warnings
- [ ] Click every new project marker; verify sidebar detail panel
- [ ] Toggle Companies View; verify all new companies appear in correct tier section
- [ ] Expand company cards; verify no format artifacts (`"N/Mx fwd"`, `"+-3%"`, `"$undefinedB"`)
- [ ] `npm run build` → zero errors

### Invariants to Maintain

| Invariant | What breaks if violated |
|-----------|------------------------|
| Every project ticker exists in `COMPANIES` | Sidebar crashes on `undefined.color` |
| Every `tier:"direct"` company in ≥1 project | Company invisible in UI (filtered by `projs.length===0`) |
| Every `tier:"upstream"` company in 0 projects | Company appears in both Direct and Supply Chain sections |
| Every company has a `tier` field | Company skipped by both `directCompanies` and `upstreamCompanies` filters |
| `pe_fwd` is number or `"N/M"` only | `fmtPE` falls through to "N/M" for any non-number, but semantics are wrong for other strings |
| `capacity` matches `/([\d.]+)\s*(GW|MW)/i` | `parseMW()` returns 500 MW default, producing wrong marker size |
| `status` is one of 4 canonical values | `statCol()` returns fallback gray; status filter buttons don't match |
| Project `id` values are unique | Wrong project displays when selected |

### Known Pitfalls

**Pitfall 1: Orphaned direct-tier companies.** Five companies were added to `COMPANIES` but never linked to any project in PR #4. They were invisible because `if(projs.length===0) return null` silently filtered them. **Now prevented by:** bidirectional integrity check logs `console.error` for any unlinked direct-tier company.

**Pitfall 2: String sentinel concatenation.** `pe_fwd:"N/M"` + `"x fwd"` produced `"N/Mx fwd"`. **Now prevented by:** `fmtPE()` helper centralizes the type check.

**Pitfall 3: Double-sign on negative growth.** `fy26e_growth:-3` with unconditional `+` prefix produced `"+-3%"`. **Now prevented by:** `fmtGrowth()` helper conditionally applies `+` only for non-negative values.

**General pattern:** Expansion amplifies edge cases. The original codebase had narrow data variance (all numbers, all positive, all linked). Each expansion introduces values the rendering code has never seen. Review with: "What values has this field never held before?"

### Testing Strategy

1. **Dev console check:** `npm run dev` → hard refresh → zero `[dc-data]` messages
2. **Visual verification:** Click new project markers, toggle Companies View, expand cards for companies with `"N/M"`, `"N/A"`, and negative growth values
3. **Build verification:** `npm run build` → zero errors; `npm run preview` → smoke test

---

## Related Documentation

### Solution Write-ups

- [`docs/solutions/ui-bugs/orphaned-entries-and-type-coercion-display-bugs.md`](../ui-bugs/orphaned-entries-and-type-coercion-display-bugs.md) -- Direct predecessor documenting the 3 bugs from PR #4 that motivated the integrity check and type guards
- [`docs/solutions/ui-bugs/map-markers-sizing-and-overlap.md`](../ui-bugs/map-markers-sizing-and-overlap.md) -- Coordinate deconfliction methodology used for 4 new projects
- [`docs/solutions/ui-bugs/svg-state-outlines-and-marker-legibility-fix.md`](../ui-bugs/svg-state-outlines-and-marker-legibility-fix.md) -- Albers projection and GeoJSON rendering architecture

### Plans & Brainstorms

- [`docs/plans/2026-02-23-feat-company-and-project-expansion-plan.md`](../../plans/2026-02-23-feat-company-and-project-expansion-plan.md) -- The 5-phase implementation plan (all phases completed)
- [`docs/brainstorms/2026-02-23-company-expansion-brainstorm.md`](../../brainstorms/2026-02-23-company-expansion-brainstorm.md) -- Design decisions for tiered model
- [`docs/plans/2026-02-22-feat-data-expansion-projects-and-vendors-plan.md`](../../plans/2026-02-22-feat-data-expansion-projects-and-vendors-plan.md) -- First expansion plan (established conventions)

### Related PRs

| PR | Description | Relationship |
|----|-------------|-------------|
| #5 | Expand to 54 companies/41 projects with tiered model | **This solution's PR** |
| #4 | First expansion: 11→36 companies, 17→37 projects | Direct predecessor; exposed orphan/type bugs |
| #3 | Map overhaul: GeoJSON states, Albers projection | Foundation architecture for marker rendering |
