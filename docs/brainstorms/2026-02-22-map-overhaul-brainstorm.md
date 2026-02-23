# Map Layout Overhaul & Data Visualization Improvements

**Date:** 2026-02-22
**Status:** Brainstorm
**Scope:** Map rendering, marker visualization, legend, electricity display

## What We're Building

A significant overhaul of the dashboard's map and data visualization layer. The current map has illegible, unrecognizable state outlines (hand-drawn with ~12-18 vertices), hard-to-perceive markers (subtle dots with faint investment rings), and a cramped horizontal legend at 8px font. The data structure and sidebar UI are fine — this is purely about the map panel and how data is visually encoded on it.

### Core Changes

1. **Replace state outlines with simplified GeoJSON data** projected through an inline Albers USA equal-area conic projection. States become instantly recognizable with geographically correct shapes.

2. **Implement inline Albers USA projection math** (~30 lines of pure JS) to replace the current `geoSvg()` hack. Both state paths and project markers use the same projection function, eliminating the need for `STATE_CENTERS` offsets and `SL` label positions for marker placement.

3. **Redesign markers as graduated symbols with capacity labels.** Larger, bolder circles with higher contrast fills. Capacity text (e.g., "1.2 GW") rendered next to or inside markers. Drop the 4-layer glow/ring system and the investment ring encoding — investment details move to the sidebar/tooltip.

4. **Redesign legend as a vertical panel** in a map corner with clear sections, larger text (10-11px), generous spacing, and visual samples that exactly match the markers on the map.

5. **Remove electricity heat map from the map.** States render as uniform dark fills. Electricity rates shown only in the project detail panel in the sidebar. This simplifies the map significantly and removes the `showElec` toggle, the `elecCol` function from rendering, and the electricity legend section.

6. **Remove state labels entirely.** With recognizable GeoJSON outlines, two-letter abbreviations are unnecessary. Removes the `SL` rendering loop and reduces visual clutter.

## Why This Approach

- **Simplified GeoJSON + inline projection** gives recognizable states without external dependencies. The Albers USA projection is the standard for US maps — it handles the lower 48 with correct area proportions.
- **Graduated symbols with labels** is the most effective cartographic encoding for the data at hand: 17 discrete locations with a single primary quantitative attribute (capacity). Labels provide exact values at a glance without requiring legend cross-referencing.
- **Removing electricity from map** is the biggest simplification win. The heat map competed visually with markers and status colors, making everything harder to read. Electricity rate is contextual detail that belongs with project data, not as a map-wide overlay.
- **Vertical legend panel** gives each legend item breathing room. A horizontal strip forces tiny text and cramped layout.

## Key Decisions

| Decision | Choice | Alternatives Considered |
|----------|--------|------------------------|
| State outline data | Simplified GeoJSON | Hand-tuned paths (current), full-res GeoJSON, D3-geo library |
| Projection | Inline Albers USA (~30 lines JS) | Pre-projected SVG paths, D3-geo dependency |
| Marker style | Graduated symbols with capacity labels | Dots+rings (current), category shapes, heat clusters |
| Investment encoding | Sidebar/tooltip only | Ring stroke width (current), marker border, icon overlay |
| Legend layout | Vertical panel in map corner | Horizontal strip (current), sidebar integrated, floating tooltip |
| Electricity visualization | Sidebar only (removed from map) | Improved heat map, simplified 3-4 tier, kept as-is |
| State labels | Removed entirely | Keep improved, hover-only |

## What Changes in the Code

### Removed
- `SL` object (state label positions) — no longer rendered on map
- `elecCol()` function usage in map rendering — states get uniform fill
- `showElec` state variable and toggle button
- Electricity legend section
- `STATE_CENTERS` object and `geoSvg()` function — replaced by projection
- 4-layer marker rendering (outer glow, investment ring, inner glow, core)
- `investStroke()` function (investment ring encoding)

### Added
- Simplified GeoJSON coordinate data for 48 states (inline or imported)
- `albersUsa()` projection function (lat/lng to SVG x/y)
- New marker rendering with capacity labels
- Vertical legend component

### Modified
- `SP` object — replaced with projected GeoJSON paths or new path generation from coordinates
- State path rendering — uniform fill, improved stroke, no electricity coloring
- `capacityRadius()` — may need re-tuning for new marker design
- Legend — completely rebuilt as vertical panel
- Project detail card in sidebar — add electricity rate display (moved from map)

## Scope Boundaries

**In scope:**
- State outline replacement (GeoJSON + projection)
- Marker redesign (graduated symbols + labels)
- Legend redesign (vertical panel)
- Remove electricity from map, add to sidebar
- Remove state labels

**Out of scope:**
- Sidebar layout or content structure changes (beyond adding electricity rate)
- Company view changes
- Data model changes (COMPANIES, PROJECTS objects)
- Adding new projects or companies
- Zoom/pan functionality
- Responsive/mobile layout

## Open Questions

None — all key decisions resolved through brainstorming dialogue.
