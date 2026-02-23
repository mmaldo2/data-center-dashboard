---
title: "Map Overhaul: GeoJSON States, Albers Projection, and Graduated Markers"
date: 2026-02-22
category: ui-bugs
severity: medium
component: Data center dashboard.jsx
symptoms:
  - US state outlines illegible and unrecognizable (12-18 vertex hand-drawn paths)
  - Markers hard to perceive (4-layer glow/ring system with subtle opacity differences)
  - Legend cramped and unreadable (horizontal strip at 8px font)
  - Map rendered upside down after initial Albers projection implementation
  - ~1,500 projection calculations repeated on every hover/click
root_cause: hand-drawn-svg-paths-and-fragile-coordinate-system
tags:
  - svg
  - map-projection
  - albers-usa
  - geojson
  - coordinate-transformation
  - data-visualization
  - performance
  - memoization
status: solved
related_files:
  - Data center dashboard.jsx
  - states-geo-data.js
related_docs:
  - docs/solutions/ui-bugs/map-markers-sizing-and-overlap.md
  - docs/brainstorms/2026-02-22-map-overhaul-brainstorm.md
  - docs/plans/2026-02-22-feat-map-overhaul-and-visualization-redesign-plan.md
---

# Map Overhaul: GeoJSON States, Albers Projection, and Graduated Markers

## Problem Statement

The AI Data Center Dashboard's map had three compounding legibility problems:

1. **Illegible state outlines.** States were rendered from hand-drawn SVG path strings (`SP` object) with only 12-18 vertices each. The shapes were abstract and unrecognizable — users couldn't identify which state was which.

2. **Hard-to-read markers.** Project markers used a 4-layer rendering system (outer glow, investment ring, inner glow, core dot) with subtle opacity differences. Investment was encoded as ring stroke width — a visual metaphor users couldn't decode without extensive tooltip guidance. The old `geoSvg()` coordinate function used per-state manual offsets, producing inconsistent marker placement.

3. **Cramped legend.** A horizontal strip at the bottom with 8px text, trying to explain status colors, capacity sizes, and investment ring widths in a single row.

## Investigation Steps

1. Evaluated options: D3-geo library, pre-projected SVG, full-resolution GeoJSON, simplified GeoJSON with inline projection.
2. Chose simplified GeoJSON + inline Albers projection (~15 lines JS) to avoid external dependencies while achieving geographic accuracy.
3. Built a data pipeline: Census 20m data (1.4MB) -> Mapshaper 5% simplification (53KB) -> Node.js filtering to 48 states (40KB) -> JS constant format (37KB).
4. Implemented Snyder's Albers USA equations as an IIFE.
5. Discovered the map rendered upside down — SVG y-axis inversion bug.
6. Post-implementation review found unmemoized path computation causing unnecessary work on every render.

## Root Cause

**State legibility:** Hand-drawn SVG paths with insufficient vertices produced abstract shapes, not recognizable US states.

**Marker readability:** Encoding two quantitative variables simultaneously (capacity as radius AND investment as stroke width) with low-contrast visual layers made markers indecipherable.

**Y-axis inversion:** SVG's coordinate system has y increasing downward, but the Albers projection formula `y = S * (r0 - r*cos(theta)) + TY` produced y values where north was at the bottom. The translate component was added instead of subtracted.

**Render performance:** `geoToPath()` was called inline in JSX, recomputing all 48 state paths (~1,500 trig operations) on every hover/click re-render.

## Solution

### 1. GeoJSON Data Pipeline

Replaced hand-drawn `SP` paths with real geographic data:

- Source: US Census Bureau 20m cartographic boundary data
- Simplified via Mapshaper to 5% (preserves shape recognition)
- Filtered to 48 contiguous states
- Exported as `STATES_GEO` array in `states-geo-data.js` (37KB)

Each state object: `{ abbr, name, type: "Polygon"|"MultiPolygon", coords }`

### 2. Inline Albers USA Projection

Replaced the fragile `geoSvg()` offset lookup with a proper map projection:

```javascript
const albersUsa = (() => {
  const RAD = Math.PI / 180;
  const phi1 = 29.5 * RAD, phi2 = 45.5 * RAD;
  const phi0 = 38.5 * RAD, lam0 = -96 * RAD;
  const n = (Math.sin(phi1) + Math.sin(phi2)) / 2;
  const C = Math.cos(phi1) ** 2 + 2 * n * Math.sin(phi1);
  const r0 = Math.sqrt(C - 2 * n * Math.sin(phi0)) / n;
  // Scale and translate to fit 960x600 SVG viewBox
  const S = 1070, TX = 480, TY = 260;
  return (lng, lat) => {
    const phi = lat * RAD, theta = n * (lng * RAD - lam0);
    const r = Math.sqrt(C - 2 * n * Math.sin(phi)) / n;
    return { x: S * r * Math.sin(theta) + TX, y: TY - S * (r0 - r * Math.cos(theta)) };
  };
})();
```

Both state paths and project markers use the same projection, guaranteeing spatial consistency.

### 3. Y-Axis Inversion Fix

The critical bug: SVG y increases downward, projection y increases upward.

```javascript
// WRONG (map upside down):
y: S * (r0 - r * Math.cos(theta)) + TY

// CORRECT:
y: TY - S * (r0 - r * Math.cos(theta))
```

Negating the projection term and using TY as origin matches D3's `translate_y - scale * y_albers` pattern.

### 4. GeoJSON to SVG Path Conversion

```javascript
const ringToPath = (ring) =>
  ring.map(([lng, lat], i) => {
    const { x, y } = albersUsa(lng, lat);
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join('') + 'Z';

const geoToPath = (st) => {
  if (st.type === 'Polygon') return st.coords.map(ringToPath).join('');
  if (st.type === 'MultiPolygon') return st.coords.flat().map(ringToPath).join('');
  return '';
};
```

Handles both Polygon and MultiPolygon geometries (needed for MI, FL, VA, etc.). `toFixed(1)` keeps path strings compact while maintaining sub-pixel accuracy.

### 5. Pre-computed State Paths

Eliminated per-render recomputation by computing paths once at module scope:

```javascript
const STATE_PATHS = STATES_GEO.map(st => ({
  abbr: st.abbr, name: st.name, d: geoToPath(st)
}));
```

Render uses `st.d` directly instead of calling `geoToPath(st)` in JSX.

### 6. Marker Simplification

Replaced 4-layer glow/ring with single graduated circle + capacity text label:

- `capacityRadius(mw)` uses sqrt scaling: 150MW -> 5px, 5GW -> 16px (area proportional to capacity)
- Transparent hit-area circle `Math.max(r+6, 12)` ensures small markers remain clickable
- Investment encoding removed from map — details live in sidebar only

### 7. Vertical Legend

Replaced cramped horizontal strip with top-right vertical panel:
- Two sections: Status (color dots) and Capacity (graduated circles)
- 9-10px text with generous spacing
- Semi-transparent background with backdrop blur

## What Was Removed

- `SP` (hand-drawn SVG path strings)
- `SL` (state label positions)
- `ELEC` (electricity rates per state)
- `geoSvg()` and `STATE_CENTERS` (fragile coordinate lookup)
- `elecCol()`, `showElec` toggle, electricity legend
- `parseInvestment()`, `investStroke()` (investment ring encoding)
- State abbreviation text labels

## Prevention & Best Practices

### Geographic Data
- Always source from authoritative datasets (Census Bureau, Natural Earth) — never hand-draw geographic boundaries.
- Use cartographic simplification tools (Mapshaper) rather than manual vertex reduction.

### SVG Coordinate Systems
- Document coordinate system assumptions in code comments. SVG y increases downward; most projection math assumes y increases upward.
- Test projected coordinates against known reference points (Seattle, Miami, etc.) before rendering.
- Cross-validate custom projection output against D3-geo for sample coordinates.

### Render Performance
- Pre-compute all static geometric data at module scope, not in JSX.
- Use `useMemo` only for data that depends on React state/props.
- Profile SVG rendering during hover/click interactions — target 60 FPS.

### Visual Encoding
- Encode at most one quantitative variable per visual property (size, color, stroke).
- Apply the "squint test" — if you can't distinguish markers from 3 feet away, the encoding is too subtle.
- Use text labels for exact values rather than relying on visual decoding alone.

### Documentation
- Update CLAUDE.md in the same commit as architectural changes.
- Treat stale documentation as a bug — removed features referenced in docs mislead future developers.

## Related Documentation

- [Map Markers: Sizing and Overlap](./map-markers-sizing-and-overlap.md) — Predecessor solution for data-driven marker sizing
- [Map Overhaul Brainstorm](../../brainstorms/2026-02-22-map-overhaul-brainstorm.md) — Decision log for this overhaul
- [Map Overhaul Plan](../../plans/2026-02-22-feat-map-overhaul-and-visualization-redesign-plan.md) — Implementation plan with calibration details
