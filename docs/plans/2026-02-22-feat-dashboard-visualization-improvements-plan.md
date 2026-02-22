---
title: "feat: Dashboard Visualization Improvements"
type: feat
status: completed
date: 2026-02-22
brainstorm: docs/brainstorms/2026-02-22-dashboard-visualization-improvements-brainstorm.md
---

# feat: Dashboard Visualization Improvements

## Overview

Improve the AI Data Center Investment Map with more recognizable state outlines and data-driven map markers that visually encode project capacity (dot size) and investment amount (ring thickness). All changes are within the single `Data center dashboard.jsx` file.

## Problem Statement / Motivation

Currently all 17 project markers look identical — a 150 MW facility is the same size as a 5 GW mega-campus. The state outlines are also too abstract (4-7 straight-line vertices) to be recognizable. These changes make the map immediately informative at a glance before any interaction.

## Proposed Solution

Three coordinated changes to `Data center dashboard.jsx`:

1. **Improved state SVG paths** — More vertices and subtle curves in the `SP` object while keeping the same 850x570 coordinate space and stylized aesthetic
2. **Capacity-scaled markers** — Parse capacity strings to numeric MW, scale dot radius via sqrt
3. **Investment ring** — Parse investment strings to numeric $B, render as a stroke-only circle around each marker

## Technical Approach

### Phase 1: Data Parsing Utilities

Add two parser functions after the existing data constants (after line 198):

**`Data center dashboard.jsx` — parseMW**
```jsx
const parseMW = (s) => {
  const m = s.match(/([\d.]+)\s*(GW|MW)/i);
  if (!m) return 500; // fallback to median
  return parseFloat(m[1]) * (m[2].toUpperCase() === 'GW' ? 1000 : 1);
};
```

**`Data center dashboard.jsx` — parseInvestment**
```jsx
const parseInvestment = (s) => {
  const m = s.match(/\$([\d.]+)B/i);
  return m ? parseFloat(m[1]) : 10; // fallback to median
};
```

The `"+"` suffix on strings like `"$100B+"` is stripped — treated as the base number.

### Phase 2: Capacity-Scaled Marker Radius

**Scaling parameters:**
- Sqrt scale mapping capacity to radius
- **Min radius: 4** (for 150 MW — Colossus)
- **Max radius: 14** (for 5,000 MW — Hyperion)
- **Selected offset: +3** (additive, giving selected range 7–17)

```jsx
const sqrtMin = Math.sqrt(150), sqrtMax = Math.sqrt(5000);
const capacityRadius = (mw) => 4 + (Math.sqrt(mw) - sqrtMin) / (sqrtMax - sqrtMin) * 10;
```

**Resulting marker sizes (unselected):**

| Project | Capacity | Core r | Outer glow r |
|---------|----------|--------|-------------|
| Colossus | 150 MW | 4.0 | 14.0 |
| Meta Beaver Dam | 300 MW | 5.5 | 15.5 |
| 4 projects | 500 MW | 7.3 | 17.3 |
| 2 projects | 600 MW | 7.8 | 17.8 |
| 2 projects | 800 MW | 8.8 | 18.8 |
| Prometheus / Vantage | 1 GW | 10.3 | 20.3 |
| Stargate Abilene | 1.2 GW | 10.9 | 20.9 |
| Project Rainier | 2.2 GW | 13.0 | 23.0 |
| Homer City | 4.5 GW | 13.8 | 23.8 |
| Hyperion | 5 GW | 14.0 | 24.0 |

Scale is **absolute** — same MW always maps to same radius regardless of active filters.

### Phase 3: Investment Ring

Add a stroke-only circle between the mid-glow and outer-glow layers in the marker `<g>`:

- **Ring radius:** `r + 6` (outside core dot, between glow layers)
- **Stroke color:** White at 35% opacity — neutral, reads against all status colors
- **Stroke-width range:** 0.8 to 4 SVG units, sqrt-scaled from $2B–$100B
- **Fill:** none

```jsx
const investStroke = (billions) => {
  const sqMin = Math.sqrt(2), sqMax = Math.sqrt(100);
  return 0.8 + (Math.sqrt(billions) - sqMin) / (sqMax - sqMin) * 3.2;
};
```

**Updated marker rendering order (inside `<g>`):**
1. Outer glow circle — `r+10`, status color, 8% opacity
2. **Investment ring** — `r+6`, white stroke, 35% opacity, no fill *(new)*
3. Mid glow circle — `r+4`, status color, 15% opacity *(offset reduced from +5 to +4 to avoid ring/glow collision)*
4. Core dot — `r`, status color, 90% opacity

### Phase 4: Dynamic Label Positioning

Replace the hardcoded `y={pos.y - 28}` with a dynamic offset based on scaled radius:

```jsx
const labelY = pos.y - (r + 10 + 6); // clearance above outer glow
```

The label rect `y` becomes `labelY` and the text `y` becomes `labelY + 11`.

### Phase 5: Ohio Marker Overlap Fix

The two Ohio projects (Stargate Ohio at 40.08/-82.91 and Prometheus at 40.08/-82.81) resolve to positions ~0.9 SVG units apart — completely overlapping.

**Fix:** Adjust the lat/lng values slightly to create visual separation:
- Stargate Ohio: shift lat to ~40.35 (northward)
- Prometheus: shift lat to ~39.80 (southward)

This creates ~7 SVG units of separation (at 13 px/degree). Their smaller markers (600 MW r~7.8, 1 GW r~10.3) will still be close but distinguishable and independently clickable.

Also review Wisconsin cluster (4 projects) — apply minor coordinate adjustments if markers overlap at the new variable sizes.

### Phase 6: Improved State SVG Paths

Replace the `SP` object with moderately improved state outlines:
- Increase vertex count to ~15-30 per state (from current 4-7)
- Add `Q` (quadratic Bezier) curves for recognizable coastal/border features
- Stay within the same 850x570 coordinate space
- Keep the dark-terminal schematic aesthetic — not photorealistic

After updating paths, verify:
- `SL` label positions still visually center within new outlines
- `geoSvg()` still places all 17 markers within correct state boundaries
- Adjacent state edges align better (reduce gap artifacts)

### Phase 7: Legend Update

Extend the existing bottom-left legend to include:

**Capacity size legend** — 3 sample circles with labels:
- Small dot (r~4): "150 MW"
- Medium dot (r~9): "1 GW"
- Large dot (r~14): "5 GW"

**Investment ring legend** — 2 sample rings:
- Thin ring: "$2B"
- Thick ring: "$100B"

Layout as an additional flex row below the existing electricity and status legends. If it overlaps Louisiana markers, shift legend position or make it collapsible.

### Phase 8: Add "Planned" to Legend and Filters

The "Planned" status (used by Hyperion — the largest marker at 5 GW) renders in gray but is missing from both the legend and filter buttons. Add it to:
- The status legend row (gray dot + "Planned" label)
- The filter button array: `["all","Operational","Under Construction","Announced","Planned"]`

## Acceptance Criteria

- [x] State outlines are more recognizable (15-30 vertices, subtle curves) while keeping stylized look
- [x] Marker dot radius scales with capacity — 150 MW is visibly smaller than 5 GW
- [x] Investment ring is visible on all markers — thicker for higher investment
- [x] Ohio projects are visually separated and independently clickable
- [x] Selected marker label does not overlap the marker glow at any size
- [x] Legend explains marker size (capacity) and ring (investment)
- [x] "Planned" status appears in legend and filter buttons
- [x] All existing interactions still work (click marker, filter, electricity toggle, companies view)
- [x] No markers render outside their state boundaries after path updates

## Dependencies & Risks

**Risks:**
- State path updates are the most labor-intensive phase — ~48 paths need manual improvement in the same coordinate space. Changes to paths may shift visual state centers, requiring `SL` label position adjustments.
- Wisconsin cluster (4 projects in ~15 SVG units) may still be congested even after Ohio fix. May need further coordinate adjustments after visual testing.

**Dependencies:**
- Phase 6 (state paths) is independent of Phases 2-5 (markers) and can be done in parallel
- Phase 7 (legend) depends on Phases 2-3 (needs final radius/ring values)
- Phase 8 (Planned status) is independent and can be done anytime

## References & Research

- Brainstorm: `docs/brainstorms/2026-02-22-dashboard-visualization-improvements-brainstorm.md`
- All changes in single file: `Data center dashboard.jsx`
- Current marker code: lines 276-288
- State paths: lines 146-195 (`SP` object)
- State labels: line 196 (`SL` object)
- Geo conversion: lines 201-206 (`geoSvg` function)
- Status color function: line 208 (`statCol`)
- Style constants: lines 209-210 (`F`, `D` fonts), lines 235-239 (`S` object)
