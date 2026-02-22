---
title: "Map Markers: Data-Driven Sizing and Overlap Resolution"
category: ui-bugs
component: Data center dashboard.jsx
status: solved
date: 2026-02-22
tags:
  - svg
  - visualization
  - data-encoding
  - marker-scaling
  - overlap-fix
  - react
related_modules:
  - SP (state paths)
  - SL (state labels)
  - geoSvg (geo conversion)
  - statCol (status colors)
severity: medium
root_cause: fixed-size-markers-and-coordinate-collisions
---

# Map Markers: Data-Driven Sizing and Overlap Resolution

## Problem Statement

The AI Data Center Investment Map dashboard rendered all 17 project markers at identical size (`r=6` unselected, `r=10` selected), making a 150 MW facility visually indistinguishable from a 5 GW mega-campus. Additionally, overlapping coordinates in Ohio (2 projects) and Wisconsin (4 projects) caused markers to stack on top of each other, preventing independent selection. State outlines used only 4-7 straight-line vertices, making them too abstract to recognize.

### Symptoms

- All markers identical size regardless of capacity (150 MW vs 5 GW)
- No visual encoding of investment amount ($2B vs $100B+)
- Ohio projects (Stargate Ohio + Prometheus) completely overlapping at ~40.08/-82.91
- Wisconsin cluster (4 projects) congested within ~15 SVG units
- State outlines unrecognizable (4-7 vertices, straight lines only)
- "Planned" status missing from legend and filter buttons

## Root Cause Analysis

1. **Fixed marker radius**: The original marker rendering used hardcoded `r=6` (unselected) and `r=10` (selected) for all projects, ignoring the `capacity` and `investment` data fields already present in the dataset.

2. **Coordinate collisions**: Multiple projects shared nearly identical lat/lng values. The `geoSvg()` function converts coordinates to SVG space at ~9 px/degree longitude and ~13 px/degree latitude, so small coordinate differences produced sub-pixel marker separation.

3. **String data format**: Capacity (`"1.2 GW"`, `"500 MW"`) and investment (`"$100B+"`, `"$3B"`) were stored as display strings with no numeric parsing, preventing proportional scaling.

## Solution

### Phase 1: Data Parsing Utilities

Added four utility functions after the data constants:

```jsx
// Parse capacity strings to numeric MW
const parseMW = (s) => {
  const m = s.match(/([\d.]+)\s*(GW|MW)/i);
  if (!m) return 500;
  return parseFloat(m[1]) * (m[2].toUpperCase() === 'GW' ? 1000 : 1);
};

// Parse investment strings to numeric billions
const parseInvestment = (s) => {
  const m = s.match(/\$([\d.]+)B/i);
  return m ? parseFloat(m[1]) : 10;
};

// Square root scale: capacity (150-5000 MW) -> radius (4-14)
const capacityRadius = (mw) =>
  4 + (Math.sqrt(mw) - Math.sqrt(150)) / (Math.sqrt(5000) - Math.sqrt(150)) * 10;

// Square root scale: investment ($2B-$100B) -> stroke-width (0.8-4.0)
const investStroke = (b) =>
  0.8 + (Math.sqrt(b) - Math.sqrt(2)) / (Math.sqrt(100) - Math.sqrt(2)) * 3.2;
```

**Why square root?** Area is proportional to r^2, so sqrt scaling makes the *area* of dots proportional to capacity. The 33x raw capacity range (150-5000 MW) becomes a manageable ~3.5x radius range (4-14).

### Phase 2: Updated Marker Rendering

Replaced the fixed-radius 3-circle marker with a 4-layer data-driven marker:

```jsx
const mw = parseMW(p.capacity);
const inv = parseInvestment(p.investment);
const baseR = capacityRadius(mw);
const r = isSel ? baseR + 3 : baseR;
const iRing = investStroke(inv);
const labelY = pos.y - (r + 10 + 6); // Dynamic label offset

// Rendering order (back to front):
// 1. Outer glow: r+10, status color, 8% opacity
// 2. Investment ring: r+6, white stroke, 35% opacity, no fill (NEW)
// 3. Mid glow: r+4, status color, 15% opacity
// 4. Core dot: r, status color, 90% opacity
```

### Phase 3: Overlap Fixes

Adjusted lat/lng coordinates to create visual separation:

**Ohio (2 projects):**
- Stargate Ohio (id:3): lat 40.08 -> 40.45, lng -82.91 -> -83.1
- Prometheus (id:8): lat 40.08 -> 39.72, lng -82.81 -> -82.55

**Wisconsin (4 projects):**
- Apple Mt. Pleasant (id:6): lat 42.72 -> 42.55, lng -87.84 -> -88.5
- Meta Chippewa Falls (id:15): lat 44.94 -> 43.15, lng -91.39 -> -87.2
- Microsoft Mt. Pleasant (id:16): lat 42.74 -> 43.80, lng -87.90 -> -89.3

### Phase 4: Improved State Paths

Replaced all 48 state outlines in the `SP` object with moderately improved paths featuring 15-20+ vertices each and subtle curves, while staying in the same 850x570 coordinate space. Updated `SL` label positions to align.

### Phase 5: Legend and Filters

- Added capacity legend with 3 computed sample dots (150 MW, 1 GW, 5 GW)
- Added investment ring legend with 2 samples ($2B thin, $100B thick)
- Added "Planned" to filter buttons array and status legend
- Added explicit `"Planned"` case in `statCol`: returns `"#94a3b8"`

## Investigation Steps

1. **Identified the problem**: All markers rendered at fixed r=6/10 despite having capacity and investment data
2. **Checked data format**: Capacity stored as `"1.2 GW"`, investment as `"$100B+"` — needed regex parsing
3. **Chose sqrt scaling**: Linear would make small markers invisible; log too compressed; sqrt gives area-proportional encoding
4. **Found overlaps**: Ohio projects had ~0.9 SVG unit separation; Wisconsin cluster had 4 projects in ~15 SVG units
5. **Tested coordinate adjustments**: Shifted lat/lng to create sufficient SVG-space separation for independently clickable markers
6. **Architecture review caught**: Wisconsin id:6 and id:15 still overlapping, legend using hardcoded radii, inconsistent sqrt patterns

## Prevention Strategies

1. **Numeric data alongside display strings**: When storing data for visualization, include parsed numeric fields (e.g., `capacityMW: 1200`) alongside display strings (`capacity: "1.2 GW"`) to avoid runtime parsing.

2. **Overlap detection utility**: Add a function that checks pairwise SVG distances between markers and warns when separation is less than the sum of their radii.

3. **Use computed values in legends**: Always derive legend sample values from the same scaling functions used for rendering, rather than hardcoding approximate values.

4. **Consistent scaling patterns**: When multiple visual properties use the same scaling approach (sqrt), use a shared utility or at minimum the same inline pattern to prevent drift.

5. **Test with extreme data**: When adding data-driven sizing, test with both minimum and maximum values in the dataset to ensure the visual range is readable.

6. **Coordinate deconfliction**: When placing multiple markers from real-world coordinates, check that the projection function produces sufficient pixel/SVG-unit separation for the expected marker sizes.

7. **Explicit status handling**: When a color/style function maps status strings to visual properties, handle all known statuses explicitly rather than relying on catch-all defaults.

8. **Visual regression testing**: For SVG-heavy dashboards, capture before/after screenshots when modifying geometry (paths, coordinates, radii) to catch overlap and alignment issues.

## References

- Brainstorm: `docs/brainstorms/2026-02-22-dashboard-visualization-improvements-brainstorm.md`
- Plan: `docs/plans/2026-02-22-feat-dashboard-visualization-improvements-plan.md`
- All changes in: `Data center dashboard.jsx`
- Branch: `feat/dashboard-visualization-improvements`
- Commit: `a733093`
