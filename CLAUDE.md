# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive React dashboard mapping major US AI data center projects and the public companies involved. Single-component architecture with all data, styling, and logic inline.

## Development Commands

```bash
npm run dev      # Start Vite dev server (hot reload)
npm run build    # Production build
npm run preview  # Preview production build
```

No test framework, linter, or formatter is configured.

## Architecture

**Single-component app.** The entire dashboard lives in one file:

- **`Data center dashboard.jsx`** — Default export `FusedDashboard`. Contains all data constants, utility functions, state management, and JSX rendering. Uses only `useState` and `useMemo` from React (no external dependencies).
- **`states-geo-data.js`** — Exports `STATES_GEO`, an array of 48 GeoJSON-like objects (one per contiguous US state) with `abbr`, `name`, `type` (`"Polygon"` or `"MultiPolygon"`), and `coords` fields. Generated from Census 20m data simplified via Mapshaper.
- **`src/main.jsx`** — Entry point. Imports `FusedDashboard` from the root and mounts it to `#root`.
- **`index.html`** — Minimal shell with global reset and dark background (`#060a13`).

### Inline Data Structures

All data is hardcoded at the top of the dashboard file:

- **`COMPANIES`** — Object keyed by ticker symbol (VRT, NVDA, ORCL, etc.). Financial metrics and DC-specific data.
- **`PROJECTS`** — Array of 17 projects. Each has geo coordinates (`lat`, `lng`), capacity/investment, status, `elecRate` (cents/kWh), and a `companies` array linking to `COMPANIES` entries with project-specific roles.

### Map Rendering

The map is pure inline SVG (no mapping library). State outlines are rendered from `STATES_GEO` GeoJSON data projected through an inline **Albers USA equal-area conic projection** (`albersUsa(lng, lat)` — note `lng` first, matching GeoJSON convention). Both state paths and project markers use the same projection function.

- **`albersUsa(lng, lat)`** — IIFE computing Snyder's Albers equations. Standard parallels 29.5N/45.5N, center 96W/38.5N, scale 1070, translate [480, 260] for a 960x600 SVG viewBox.
- **`ringToPath(ring)`** / **`geoToPath(st)`** — Convert GeoJSON coordinate rings to SVG path `d` strings. Handles both Polygon and MultiPolygon types.
- **`STATE_PATHS`** — Pre-computed array of `{abbr, name, d}` objects. Paths are projected once at module load, not on each render.
- **Marker radius** scales by capacity via `capacityRadius()` (sqrt scale, 150 MW → 5px, 5 GW → 16px).
- Overlapping projects (Ohio, Wisconsin clusters) have manually adjusted coordinates for visual separation.

### Styling

All styles are inline JS objects. Two Google Fonts loaded via `<link>` tags rendered by the component: **Syne** (headings) and **JetBrains Mono** (body/data). Dark theme throughout.

## UI Modes

1. **Map + Project Sidebar** (default) — GeoJSON state outlines (uniform dark fill), clickable graduated-symbol project markers with capacity labels, sidebar with project list and detail panel showing electricity rates.
2. **Companies View** — Toggle via header button. Companies ranked by project involvement count with expandable financial detail.

## Key State Variables

- `sel` — Selected project ID
- `hov` — Hovered state abbreviation
- `fSt` — Status filter ("all", "Operational", "Under Construction", "Announced", "Planned")
- `companyView` — Toggle between map and companies view
- `selCompany` — Selected company ticker in companies view

## Working with This Codebase

- The dashboard file is ~460 lines with data, utilities, and rendering all inline. When modifying, locate the relevant section by searching for data constant names or function names.
- Capacity and investment are stored as display strings (`"1.2 GW"`, `"$100B+"`). Use `parseMW()` to extract numeric MW values.
- When adding new projects, just provide real `lat`/`lng` — the Albers projection handles placement automatically. Check that dense clusters (Ohio, Wisconsin) have enough coordinate separation.
- The `statCol()` function maps status strings to colors — add explicit cases for any new statuses.
- The CSV file (`Copy of Data_Centers_Database - FracTracker Data Centers.csv`) is an external FracTracker dataset (~1,358 rows) not currently consumed by the dashboard.

## Documentation

- `docs/brainstorms/` — Feature exploration documents
- `docs/plans/` — Implementation plans
- `docs/solutions/` — Solved problem write-ups with root cause analysis
