---
title: "Orphaned company entries and type coercion display bugs after data expansion"
date: 2026-02-23
status: verified
severity: medium
components: ["dc-data.js", "Data center dashboard.jsx"]
root_cause: "Mixed data types in financial fields and incomplete company-project linkages after bulk expansion"
tags: [data-integrity, display-bug, type-safety, expansion-regression, code-review]
---

# Orphaned Entries and Type Coercion Display Bugs

## Problem

After expanding the dashboard from 17 to 37 projects and 11 to 36 companies (PR #4), a 6-agent code review uncovered three P2 bugs:

1. **Five orphaned companies** (AMD, AVGO, JCI, TSLA, COHR) defined in `COMPANIES` but never referenced in any project's `companies` array. The Companies View filtered them out with `if(projs.length===0) return null`, making them invisible in the UI.
2. **`pe_fwd` display artifact**: LUMN and CRWV had `pe_fwd:"N/M"` (string) while 34 others used numbers. Rendering `{co.pe_fwd}x fwd` produced "N/Mx fwd" at 3 locations.
3. **Negative growth double sign**: LUMN had `fy26e_growth:-3`. Rendering `` +${co.fy26e_growth}% `` produced "+-3%" at 2 locations.

## Root Cause Analysis

**Orphaned companies**: Bulk data expansion added 25 new COMPANIES entries but only linked 20 of them to projects. The dev-time integrity check at the end of `dc-data.js` validated only the forward direction (project ticker references into COMPANIES), not the reverse (companies referenced by at least one project). Five entries slipped through undetected.

**Mixed `pe_fwd` type**: Two companies (LUMN, CRWV) have negative or meaningless P/E ratios, represented as the string `"N/M"` instead of a number. The rendering code used string interpolation (`{co.pe_fwd}x fwd`) which concatenated the "N/M" string directly with "x fwd", producing "N/Mx fwd" with no space.

**Negative growth formatting**: The template literal `+${co.fy26e_growth}%` unconditionally prepended a `+` sign. When the value was `-3`, JavaScript's number-to-string conversion preserved the negative sign, producing `+-3%`.

## Solution

### Fix 1: Link orphaned companies to relevant projects

Added each company to 2-3 projects in `dc-data.js` with researched role/detail strings:

| Company | Projects Linked | Rationale |
|---------|----------------|-----------|
| AMD | Stargate Abilene, Microsoft ATL, Prometheus | OpenAI partnership (MI450), Azure MI300X VMs, Meta EPYC servers |
| AVGO | Council Bluffs, Haskell County, Google Virginia | Broadcom co-develops every Google TPU generation |
| JCI | Stargate Abilene, Hyperion, Homer City | Largest campuses needing Silent-Aire thermal management |
| TSLA | Colossus, Haskell County | $430M xAI Megapack deal; Google/Intersect 15.3 GWh contract |
| COHR | CoreWeave NEST, Prometheus, CoreWeave Denton | 800G optical transceivers behind Arista Ethernet switches |

### Fix 2: Type-safe `pe_fwd` rendering

Updated 3 locations in `Data center dashboard.jsx` to check type before formatting:

```javascript
// Before (3 locations):
{co.pe_fwd}x fwd

// After:
{typeof co.pe_fwd==="number"?co.pe_fwd+"x fwd":"N/M"}
```

### Fix 3: Sign-aware growth formatting

Updated 2 locations to conditionally apply the `+` sign:

```javascript
// Before (2 locations):
`+${co.fy26e_growth}%`

// After:
`${co.fy26e_growth>=0?"+":""}${co.fy26e_growth}%`
```

## Prevention Strategies

### 1. Bidirectional integrity check

Extend the existing dev-time validator in `dc-data.js` to check both directions:

```javascript
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  const referencedTickers = new Set();

  // Forward: project → company (existing)
  PROJECTS.forEach(p => {
    p.companies.forEach(c => {
      if (!COMPANIES[c.ticker]) {
        console.error(`[dc-data] Project "${p.name}" (id:${p.id}) references unknown ticker "${c.ticker}"`);
      }
      referencedTickers.add(c.ticker);
    });
  });

  // Reverse: company → project (NEW)
  Object.keys(COMPANIES).forEach(ticker => {
    if (!referencedTickers.has(ticker)) {
      console.warn(`[dc-data] Company "${ticker}" (${COMPANIES[ticker].name}) not referenced by any project`);
    }
  });
}
```

### 2. Guard mixed types at display time

When a financial field can be either a number or a sentinel string like `"N/M"`, always check `typeof` before applying numeric formatting (suffixes like `x`, `%`, `$`).

### 3. Sign-aware formatting

Never hardcode a `+` prefix before a value that can be negative. Use conditional logic: `value >= 0 ? "+" : ""` lets JavaScript's native negative sign handle the `-` case.

### 4. Code review checklist for data expansions

- Every new COMPANIES entry must appear in at least one project's `companies` array
- Run `npm run dev` and check console for zero integrity warnings
- Verify `pe_fwd` is either a number or `"N/M"` — no other string values
- Verify `fy26e_growth` renders correctly for positive, negative, and zero values
- Verify all new company colors are visually distinct at badge alpha levels

## Related Documentation

- [Map Markers: Data-Driven Sizing and Overlap](map-markers-sizing-and-overlap.md) — Establishes data parsing patterns (`parseMW()`) and coordinate deconfliction
- [Map Overhaul: GeoJSON States and Albers Projection](svg-state-outlines-and-marker-legibility-fix.md) — Documents the SVG rendering architecture and data extraction pattern
- PR: https://github.com/mmaldo2/data-center-dashboard/pull/4
