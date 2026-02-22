# Dashboard Visualization Improvements

**Date:** 2026-02-22
**Status:** Brainstorm

## What We're Building

Visual improvements to the AI Data Center Investment Map dashboard, focused on two areas:

1. **More realistic state outlines** — Replace the current abstract 4-7 vertex polygons with moderately improved paths that are recognizable as real states while keeping the stylized dark-terminal aesthetic.

2. **Data-driven map markers** — Encode capacity and investment amount directly on the project markers using two independent visual channels:
   - **Dot radius** scales with **capacity** (MW) using a square root scale so area is proportional to capacity
   - **Outer ring thickness** encodes **investment** level ($2B–$100B+)

## Why This Approach

**State outlines:** The current paths are so simplified (straight-line segments, ~5 vertices) that many states are hard to recognize. Adding more vertices and light curves makes the map immediately legible without going full GeoJSON (which would bloat the file and lose the schematic feel).

**Capacity as dot size:** This is the single highest-impact change. Right now a 150 MW facility looks identical to a 5 GW mega-campus. Square root scaling ensures area is proportional to capacity while keeping all markers readable (the 33x raw range becomes ~5.8x in radius).

**Investment as ring:** Investment correlates with capacity but not perfectly (e.g., Stargate Abilene is 1.2 GW / $100B+ while Hyperion is 5 GW / $50B+). A separate ring channel lets users see both dimensions at a glance without overloading a single visual property.

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| State outline fidelity | Moderately improved (more vertices, keep stylized) | Recognizable states without full GeoJSON weight |
| Primary marker encoding | Dot radius = capacity (MW) | Most impactful data field, biggest visual gap |
| Secondary marker encoding | Outer ring thickness = investment ($) | Independent channel, avoids conflating with capacity |
| Scaling method | Square root of capacity for radius | Area-proportional, handles 150 MW–5 GW range well |
| Hover tooltips | Not adding | Click-to-sidebar is sufficient, keeps map clean |
| FracTracker CSV integration | Deferred | Focus stays on the 17 curated major projects |
| String parsing needed | Yes — capacity ("1.2 GW") and investment ("$100B+") must be parsed to numeric values | Required before any proportional sizing works |

## Scope

### In scope
- Improved state SVG paths (more vertices, subtle curves, still hand-tuned coordinate space)
- Parse `capacity` strings to numeric MW values
- Parse `investment` strings to numeric dollar values
- Scale marker dot radius by capacity (sqrt scale)
- Add outer ring whose thickness/opacity reflects investment amount
- Add a map legend explaining marker size = capacity and ring = investment
- Ensure selected-state marker styling still works with variable sizes

### Out of scope
- FracTracker CSV integration
- Hover tooltips on markers
- Project type differentiation (shape/icon)
- Year/timeline encoding on markers
- Pan/zoom on the map
- Responsive/mobile layout changes
- Company view changes

## Technical Notes

- `capacity` field needs a parser: `"1.2 GW"` → `1200`, `"500 MW"` → `500`, `"150 MW"` → `150`
- `investment` field needs a parser: `"$100B+"` → `100`, `"$3B"` → `3`, `"$50B+"` → `50`
- The existing 3-concentric-circle marker pattern can be extended — the outer ring becomes a 4th circle with stroke-width scaled to investment
- State paths stay in the same bespoke coordinate space (850x570 viewBox), just with more detailed `d` attributes
- `geoSvg()` positioning logic should still work since it's based on `SL` label coordinates, not path geometry
