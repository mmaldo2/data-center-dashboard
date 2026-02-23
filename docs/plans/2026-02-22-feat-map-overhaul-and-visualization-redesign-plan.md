---
title: "feat: Map Overhaul and Data Visualization Redesign"
type: feat
status: completed
date: 2026-02-22
brainstorm: docs/brainstorms/2026-02-22-map-overhaul-brainstorm.md
---

# feat: Map Overhaul and Data Visualization Redesign

## Overview

Replace the dashboard's illegible hand-drawn state outlines, subtle dot/ring markers, and cramped legend with geographically accurate state paths (simplified GeoJSON + inline Albers USA projection), bold graduated symbol markers with capacity labels, and a vertical legend panel. Remove the electricity heat map from the map entirely (sidebar only). Remove state abbreviation labels.

All changes target a single file: `Data center dashboard.jsx`. The data model (COMPANIES, PROJECTS) and sidebar/companies view logic are untouched except for removing the `showElec` toggle.

## Problem Statement

1. **States are unrecognizable.** Current `SP` paths use 12-18 vertices per state with straight lines only — shapes are abstract blobs.
2. **Markers are imperceptible.** The 4-layer glow/ring system at low opacity makes capacity and investment encoding invisible without careful study.
3. **Legend is unreadable.** Horizontal strip at 8px font with three dense sections crammed into one row.
4. **Electricity heat map competes visually** with status colors and markers, reducing signal for all three.

## Proposed Solution

Five coordinated changes, implemented in phases:

1. **Albers USA projection** — Pure JS projection function (~25 lines) replacing `geoSvg()` + `STATE_CENTERS` + `SL` anchoring
2. **Simplified GeoJSON state data** — ~48 states with recognizable shapes, projected at render time via the Albers function
3. **Graduated symbol markers** — Larger, higher-contrast circles with always-visible capacity labels, single-layer design
4. **Vertical legend panel** — Stacked sections with 10-11px text, samples rendered using the same functions as the map
5. **Electricity removal from map** — Delete `showElec` state, toggle button, `elecCol()` from rendering, electricity legend

## Technical Approach

### Architecture

The projection function is the foundational change. Everything else depends on it:

```
albersUsa(lng, lat) → [x, y]
    ↓                    ↓
State GeoJSON paths   Marker positions
    ↓                    ↓
SVG <path d="">       SVG <circle> + <text>
    ↓
Vertical legend (uses capacityRadius + statCol)
```

### Implementation Phases

#### Phase 1: Add Albers USA Projection Function

**Goal:** A pure JS function that converts (lng, lat) → (x, y) in SVG space, fitting the lower 48 into the existing viewport.

Add after line 198 (after `ELEC`), before utility functions:

```javascript
// Albers Equal-Area Conic projection (Snyder eq. 14-1 through 14-6)
// Standard parallels 29.5°N, 45.5°N — standard for contiguous US maps
const albersUsa = (() => {
  const RAD = Math.PI / 180;
  const phi1 = 29.5 * RAD, phi2 = 45.5 * RAD;
  const phi0 = 38.5 * RAD, lam0 = -96 * RAD;
  const n = (Math.sin(phi1) + Math.sin(phi2)) / 2;
  const C = Math.cos(phi1) ** 2 + 2 * n * Math.sin(phi1);
  const r0 = Math.sqrt(C - 2 * n * Math.sin(phi0)) / n;
  // Scale and translate tuned to fit lower 48 into ~960x600 viewport
  const S = 1070, TX = 480, TY = 260;
  return (lng, lat) => {
    const phi = lat * RAD, theta = n * (lng * RAD - lam0);
    const r = Math.sqrt(C - 2 * n * Math.sin(phi)) / n;
    return { x: S * r * Math.sin(theta) + TX, y: S * (r0 - r * Math.cos(theta)) + TY };
  };
})();
```

**Calibration:** The `S`, `TX`, `TY` values (scale=1070, translateX=480, translateY=260) are derived from D3's geoAlbers defaults for a 960x600 viewport. These should be verified by projecting known corner coordinates:
- Seattle (47.6, -122.3) → should be near top-left
- Miami (25.8, -80.2) → should be near bottom-right
- San Diego (32.7, -117.2) → should be near bottom-left
- Bangor, ME (44.8, -68.8) → should be near top-right

Adjust `TY` if the map sits too high or low. The viewBox should change from `"50 60 850 570"` to `"0 0 960 600"` to match the standard Albers output range.

**Tasks:**
- [x] Add `albersUsa` IIFE after `ELEC` constant (`Data center dashboard.jsx`)
- [x] Update SVG `viewBox` from `"50 60 850 570"` to `"0 0 960 600"` (`Data center dashboard.jsx:273`)
- [x] Verify projection output with 4 corner reference points

#### Phase 2: Replace State Outline Data

**Goal:** Replace the hand-drawn `SP` object with simplified GeoJSON coordinate arrays, projected via `albersUsa` at render time.

**Data source:** Download US Census 20m GeoJSON from eric.clst.org (`gz_2010_us_040_00_20m.json`). Simplify with Mapshaper:

```bash
npx mapshaper gz_2010_us_040_00_20m.json \
  -filter "STATE !== '02' && STATE !== '15' && STATE !== '72'" \
  -simplify 8% keep-shapes \
  -filter-fields STATE,NAME \
  -o precision=0.001 format=geojson us-states-simplified.json
```

This removes Alaska, Hawaii, and Puerto Rico, simplifies to ~8% of original vertices (recognizable but compact), and keeps only FIPS code and state name.

**Inline format:** Replace the `SP` object with a `STATES_GEO` FeatureCollection constant. Add a `geoToPath` utility that projects GeoJSON coordinates through `albersUsa` and emits SVG `d` strings:

```javascript
// Convert a GeoJSON ring through projection to SVG path segment
const ringToPath = (ring) =>
  ring.map(([lng, lat], i) => {
    const { x, y } = albersUsa(lng, lat);
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join('') + 'Z';

// Convert a GeoJSON Feature geometry to SVG path d attribute
const geoToPath = (geom) => {
  if (geom.type === 'Polygon') return geom.coordinates.map(ringToPath).join('');
  if (geom.type === 'MultiPolygon') return geom.coordinates.flat().map(ringToPath).join('');
  return '';
};
```

**Rendering:** Use `useMemo` to compute projected paths once:

```jsx
const statePaths = useMemo(() =>
  STATES_GEO.features.map(f => ({
    abbr: FIPS_TO_ABBR[f.properties.STATE],  // lookup table
    name: f.properties.NAME,
    d: geoToPath(f.geometry),
  })),
[]);
```

**Multi-polygon handling:** Michigan (Upper/Lower Peninsula), Virginia (Eastern Shore), and other multi-polygon states are handled by concatenating all rings into a single `<path d="">` string. SVG's default `nonzero` fill-rule renders this correctly. Each state is still one `<path>` element, preserving the hover interaction model.

**FIPS-to-abbreviation mapping:** A small lookup object mapping FIPS codes to 2-letter abbreviations (e.g., `"01": "AL"`) is needed for the state hover state variable `hov`, which uses abbreviations. This is ~48 entries.

**Tasks:**
- [x] Download and simplify GeoJSON data (see Mapshaper command above)
- [x] Add `STATES_GEO` constant replacing `SP` object (imported from `states-geo-data.js`)
- [x] Add `FIPS_TO_ABBR` lookup object (embedded abbreviations directly in STATES_GEO instead)
- [x] Add `ringToPath` and `geoToPath` utility functions
- [x] Add `useMemo` for computed `statePaths` (rendered inline — projection is fast enough)
- [x] Delete old `SP` object (lines 146-195)
- [x] Delete `SL` object (line 196) — no longer needed for labels or projection

#### Phase 3: Update State Rendering and Remove Electricity

**Goal:** Simplify state path rendering to uniform fills, remove electricity toggle and heat map.

**State rendering loop** (currently lines 274-277) becomes:

```jsx
{statePaths.map(({ abbr, name, d }) => (
  <path key={abbr} d={d}
    fill="#1e293b"
    fillOpacity={hov === abbr ? 0.5 : 0.3}
    stroke={hov === abbr ? "#475569" : "#1a2335"}
    strokeWidth={hov === abbr ? 1.2 : 0.5}
    style={{ cursor: "pointer", transition: "all .15s" }}
    aria-label={name}
    onMouseEnter={() => setHov(abbr)}
    onMouseLeave={() => setHov(null)}
  />
))}
```

Key changes from current:
- Fill is always `#1e293b` — no electricity coloring
- `aria-label={name}` replaces the removed text labels for accessibility
- Slightly increased base opacity (0.3 vs 0.25) for better state visibility
- State hover tooltip not added — hover highlight is sufficient since users focus on project markers

**Removals:**
- Delete `showElec` state variable (line 223)
- Delete electricity toggle button from header (line 259)
- Delete `elecCol()` function (line 213)
- Delete state label rendering loop (lines 278-280)
- Delete electricity legend section (lines 301-309)
- Delete `ELEC` object (line 198) — each project already has `elecRate` in its data
- Confirm the sidebar project detail card (line 352) still displays `project.elecRate` correctly

**Tasks:**
- [x] Replace state path rendering loop with simplified version (`Data center dashboard.jsx:274-277`)
- [x] Delete state label rendering loop (`Data center dashboard.jsx:278-280`)
- [x] Delete `showElec` state variable (`Data center dashboard.jsx:223`)
- [x] Delete electricity toggle button (`Data center dashboard.jsx:259`)
- [x] Delete `elecCol()` function (`Data center dashboard.jsx:213`)
- [x] Delete `ELEC` object (`Data center dashboard.jsx:198`)
- [x] Delete electricity legend section (`Data center dashboard.jsx:301-309`)
- [x] Verify sidebar still shows electricity rate in project detail card

#### Phase 4: Redesign Markers

**Goal:** Replace 4-layer glow/ring markers with bold single-layer graduated symbols and always-visible capacity labels.

**New marker structure** (per project):

```jsx
{filtered.map(p => {
  const { x, y } = albersUsa(p.lng, p.lat);
  const c = statCol(p.status);
  const isSel = sel === p.id;
  const mw = parseMW(p.capacity);
  const baseR = capacityRadius(mw);
  const r = isSel ? baseR + 4 : baseR;

  return (
    <g key={p.id} style={{ cursor: "pointer" }}
       onClick={() => { setSel(isSel ? null : p.id); setSelCompany(null); setCompanyView(false); }}>
      {/* Invisible hit area for small markers */}
      <circle cx={x} cy={y} r={Math.max(r + 6, 12)} fill="transparent" />
      {/* Subtle glow for selected state */}
      {isSel && <circle cx={x} cy={y} r={r + 8} fill={c} opacity={0.15} />}
      {/* Core marker */}
      <circle cx={x} cy={y} r={r} fill={c} opacity={0.85}
        stroke={isSel ? "#fff" : "rgba(0,0,0,0.3)"} strokeWidth={isSel ? 2 : 1} />
      {/* Capacity label — always visible */}
      <text x={x + r + 4} y={y + 1} fill="#e2e8f0" fontSize="8" fontWeight="600"
        fontFamily={F} style={{ pointerEvents: "none" }}>
        {p.capacity}
      </text>
      {/* Project name label — selected only */}
      {isSel && (
        <text x={x} y={y - r - 6} textAnchor="middle" fill="#e2e8f0"
          fontSize="9" fontWeight="700" fontFamily={F} style={{ pointerEvents: "none" }}>
          {p.name.length > 25 ? p.name.substring(0, 25) + '...' : p.name}
        </text>
      )}
    </g>
  );
})}
```

**Design decisions:**
- **Invisible hit area:** `Math.max(r + 6, 12)` ensures even 150 MW markers (r~4) have a 12px minimum click target
- **Single core circle** at 85% opacity with a subtle dark stroke — much bolder than the current 4-layer system
- **Capacity label always visible** to the right of the marker. `pointerEvents: "none"` prevents click interference
- **Selected glow** is a single ring at `r+8`, replacing the 3-ring glow system
- **Selected name label** above the marker (replaces the rect+text combo)

**Re-tune `capacityRadius`:** Increase the range for bolder markers:

```javascript
// Old: 4 + sqrt scale → 4-14px range
// New: 5 + sqrt scale → 5-16px range (slightly larger)
const capacityRadius = (mw) =>
  5 + (Math.sqrt(mw) - Math.sqrt(150)) / (Math.sqrt(5000) - Math.sqrt(150)) * 11;
```

**Removals:**
- Delete `investStroke()` function (line 204)
- Delete `parseInvestment()` function (line 202) — no longer used for visual encoding
- Delete old 4-layer marker rendering (lines 282-296)
- Delete `STATE_CENTERS` and `geoSvg()` (lines 207-212)

**Wisconsin cluster overlap check:** After implementing the Albers projection, calculate pairwise distances between the 4 Wisconsin markers (ids 4, 6, 15, 16) using their artificially adjusted coordinates. If any pair distance < sum of radii, adjust coordinates. The Albers projection at Wisconsin's latitude (~43°N) produces roughly 12-14 px/degree longitude and 14-16 px/degree latitude — different from the old 9/13 ratio. The current coordinate separations (0.5-1.6 degrees) should produce 7-22+ pixels of separation, which is likely adequate for r=5-10 markers, but must be visually verified.

**Tasks:**
- [x] Re-tune `capacityRadius()` function for larger range (`Data center dashboard.jsx:203`)
- [x] Replace marker rendering with new graduated symbol design (`Data center dashboard.jsx:282-296`)
- [x] Update projection call from `geoSvg(p.lat, p.lng, p.state)` to `albersUsa(p.lng, p.lat)`
- [x] Delete `investStroke()` (`Data center dashboard.jsx:204`)
- [x] Delete `parseInvestment()` (`Data center dashboard.jsx:202`)
- [x] Delete `STATE_CENTERS` and `geoSvg()` (`Data center dashboard.jsx:207-212`)
- [x] Visually verify Wisconsin cluster (ids 4, 6, 15, 16) — adjust coordinates if overlapping
- [x] Visually verify Ohio cluster (ids 3, 8) and Pennsylvania cluster (ids 11, 17)

#### Phase 5: Redesign Legend

**Goal:** Replace the horizontal legend strip with a vertical panel in the top-right corner.

**New legend structure:**

```jsx
<div style={{
  position: "absolute", top: 16, right: 16,
  background: "rgba(10,14,23,0.9)", border: "1px solid #1e293b",
  borderRadius: 8, padding: "12px 14px", minWidth: 140,
  backdropFilter: "blur(8px)",
}}>
  {/* Section: Status */}
  <div style={{ marginBottom: 10 }}>
    <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, fontFamily: F, marginBottom: 6 }}>
      Status
    </div>
    {["Operational", "Under Construction", "Announced", "Planned"].map(s => (
      <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: statCol(s), flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: F }}>{s}</span>
      </div>
    ))}
  </div>
  {/* Section: Capacity */}
  <div>
    <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, fontFamily: F, marginBottom: 6 }}>
      Capacity
    </div>
    {[["150 MW", 150], ["1 GW", 1000], ["5 GW", 5000]].map(([label, mw]) => {
      const r = capacityRadius(mw);
      return (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <svg width={r * 2 + 2} height={r * 2 + 2} style={{ flexShrink: 0 }}>
            <circle cx={r + 1} cy={r + 1} r={r} fill="#6366f1" opacity={0.85} stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
          </svg>
          <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: F }}>{label}</span>
        </div>
      );
    })}
  </div>
</div>
```

Key improvements over current:
- **Vertical layout** — each item on its own row, no cramming
- **10px font** (vs 8px) — significantly more readable
- **6px gap** between dot and text — comfortable spacing
- **Capacity samples use `capacityRadius()`** — guaranteed to match map markers
- **Two clear sections** with labeled headers (Status, Capacity)
- **Positioned top-right** — avoids overlapping with marker clusters in the south/west

**Tasks:**
- [x] Delete entire old legend block (`Data center dashboard.jsx:299-335`)
- [x] Add new vertical legend panel positioned top-right
- [x] Verify legend capacity samples visually match map markers

#### Phase 6: Cleanup and Verification

**Dead code removal checklist:**

| Code | Line | Status |
|------|------|--------|
| `SP` (old state paths) | 146-195 | Replaced by `STATES_GEO` |
| `SL` (state label positions) | 196 | Deleted (no labels, no projection anchor) |
| `ELEC` (electricity rates) | 198 | Deleted (sidebar uses `project.elecRate`) |
| `parseInvestment()` | 202 | Deleted (no investment visual encoding) |
| `investStroke()` | 204 | Deleted (no investment ring) |
| `STATE_CENTERS` | 207 | Deleted (Albers replaces offset system) |
| `geoSvg()` | 208-212 | Deleted (replaced by `albersUsa`) |
| `elecCol()` | 213 | Deleted (no electricity map coloring) |
| `showElec` state | 223 | Deleted |
| Electricity toggle button | 259 | Deleted |
| Electricity legend | 301-309 | Deleted |

**Verification steps:**
- [x] Confirm no remaining references to deleted functions/variables
- [x] Verify all 17 project markers render at correct geographic positions
- [x] Verify Wisconsin cluster markers are independently clickable
- [x] Verify Ohio and Pennsylvania clusters don't overlap
- [x] Verify clicking state paths still triggers deselection (`e.target.tagName === 'path'`)
- [x] Verify Companies View → project click → map view transition still works
- [x] Verify status filter buttons still work correctly
- [x] Verify sidebar project detail card shows electricity rate

## Acceptance Criteria

### Functional Requirements

- [x] All 48 contiguous state outlines are geographically recognizable
- [x] All 17 project markers render at correct locations within their states
- [x] Markers are sized proportionally to capacity (sqrt scaling)
- [x] Capacity labels (e.g., "1.2 GW") are visible next to each marker
- [x] Status colors (green/amber/indigo/gray) are applied to markers
- [x] Legend is a vertical panel with status and capacity sections
- [x] Legend capacity samples use the same `capacityRadius()` function as the map
- [x] Electricity rates are visible in the project detail sidebar panel
- [x] No electricity toggle button or heat map on the map
- [x] No state abbreviation labels on the map
- [x] State hover highlighting works (opacity/stroke change)
- [x] Project selection works (click marker → sidebar detail)
- [x] Project deselection works (click state/background → return to list)
- [x] Status filter buttons work correctly
- [x] Companies view toggle works, including project click cross-navigation
- [x] State paths have `aria-label` attributes with full state names

### Non-Functional Requirements

- [x] No external dependencies added (pure JS projection, imported GeoJSON data)
- [x] GeoJSON data size is reasonable (<50 KB after simplification — 37 KB)
- [x] Marker click targets are at least 12px radius (invisible hit area for small markers)
- [x] All removed code artifacts are fully cleaned up (no dead code)

## Dependencies & Risks

**GeoJSON data acquisition:** Requires downloading and simplifying Census boundary data. If the data source is unavailable, Natural Earth 110m is an alternative at lower fidelity.

**Projection calibration:** The Albers scale/translate values (1070, 480, 260) are estimates from D3 defaults. They will almost certainly need adjustment to look right in the specific viewport. Budget time for visual tuning.

**Wisconsin cluster overlap:** The 4 markers with artificially adjusted coordinates may need further adjustment under the new projection. This is the highest-risk visual issue.

**File size increase:** The simplified GeoJSON data (~20-50 KB) is larger than the current `SP` paths (~5 KB). This is an acceptable tradeoff for recognizable state outlines but should be monitored.

## References & Research

### Internal References

- Brainstorm: `docs/brainstorms/2026-02-22-map-overhaul-brainstorm.md`
- Past solution (marker sizing): `docs/solutions/ui-bugs/map-markers-sizing-and-overlap.md`
- Current implementation: `Data center dashboard.jsx` (single file, ~505 lines)

### External References

- Albers projection math: Snyder's *Map Projections — A Working Manual* (USGS PP 1395), equations 14-1 through 14-6
- D3 geoAlbers defaults: `d3-geo/src/projection/albers.js` (scale: 1070, translate: [480, 250])
- Census 20m GeoJSON: https://eric.clst.org/tech/usgeojson/
- Mapshaper simplification: https://mapshaper.org/
- Natural Earth 110m: https://datahub.io/core/geo-boundaries-us-110m
