# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive React dashboard mapping 37 US AI data center projects and 36 publicly traded companies involved. Tracks hyperscalers (AMZN, META, MSFT, ORCL, GOOGL), GPU cloud operators (CRWV), and infrastructure vendors across power, cooling, construction, energy, and networking categories.

## Development Commands

```bash
npm run dev      # Start Vite dev server (hot reload)
npm run build    # Production build
npm run preview  # Preview production build
```

No test framework, linter, or formatter is configured.

## Architecture

**Single-component app** built on React 19 + Vite 7 with zero external dependencies beyond React (no mapping library, no styling library, no state management).

**Important:** Main source files live at the **project root**, not in `src/`. Only the entry point is in `src/`.

- **`dc-data.js`** (~375 lines) — Named exports `COMPANIES` (36 entries keyed by ticker) and `PROJECTS` (37 entries). All financial metrics, project metadata, and company-project linkages. Includes a development-time referential integrity check that logs console errors for any ticker in a project's `companies` array that doesn't exist in `COMPANIES`.
- **`Data center dashboard.jsx`** (~315 lines) — Default export `FusedDashboard`. Imports data from `dc-data.js`. Contains utility functions, state management, and all JSX rendering. Uses only `useState` and `useMemo` from React.
- **`states-geo-data.js`** — Exports `STATES_GEO`, an array of 48 GeoJSON-like objects (one per contiguous US state) with `abbr`, `name`, `type` (`"Polygon"` or `"MultiPolygon"`), and `coords` fields. Generated from Census 20m data simplified via Mapshaper.
- **`src/main.jsx`** — Entry point. Imports `FusedDashboard` from the root and mounts it to `#root`.
- **`index.html`** — Minimal shell with global reset and dark background (`#060a13`).
- **`us-states-*.json`** — Intermediate GeoJSON files (`raw`, `simplified`, `final`) used to generate `states-geo-data.js`. Not consumed at runtime.

### Data Structures (dc-data.js)

- **`COMPANIES`** — Object keyed by ticker symbol (VRT, NVDA, ORCL, GOOGL, CRWV, etc.). Each entry has: `ticker`, `name`, `price`, `mcap`, `pe_fwd`, `fy26e_rev`, `fy26e_eps`, `fy26e_growth`, `op_margin`, `dc_pct`, `lc_growth`, `backlog`, `color` (hex), `role`, `summary`. Use `"N/A"` for irrelevant metrics, `"N/M"` for not-meaningful (e.g., negative earnings PE).
- **`PROJECTS`** — Array of 37 projects. Each has `id`, `name`, `state`, `lat`, `lng`, `capacity`, `investment`, `status`, `year`, `type`, `operator`, `elecRate` (cents/kWh), and a `companies` array linking to `COMPANIES` entries with project-specific `ticker`, `role`, and `detail`.

**Status values:** `"Operational"`, `"Under Construction"`, `"Announced"`, `"Planned"`. When adding from external sources, map statuses: `Permitting`/`In development`/`Broke ground`/`Restart in progress` → Under Construction; `Partially operational`/`Operational + expanding` → Operational; `Paused/Redesign` → Planned.

**Company ordering in project `companies` arrays:** (1) Operator/developer, (2) GPU/chip supplier, (3) Cooling/power infrastructure, (4) Construction, (5) Energy provider, (6) Networking/connectivity.

### Map Rendering

The map is pure inline SVG (no mapping library). State outlines are rendered from `STATES_GEO` GeoJSON data projected through an inline **Albers USA equal-area conic projection** (`albersUsa(lng, lat)` — note `lng` first, matching GeoJSON convention). Both state paths and project markers use the same projection function.

- **`albersUsa(lng, lat)`** — IIFE computing Snyder's Albers equations. Standard parallels 29.5N/45.5N, center 96W/38.5N, scale 1070, translate [480, 260] for a 960x600 SVG viewBox.
- **`ringToPath(ring)`** / **`geoToPath(st)`** — Convert GeoJSON coordinate rings to SVG path `d` strings. Handles both Polygon and MultiPolygon types.
- **`STATE_PATHS`** — Pre-computed array of `{abbr, name, d}` objects. Paths are projected once at module load, not on each render.
- **Marker radius** scales by capacity via `capacityRadius()` (sqrt scale, 150 MW → 5px, 5 GW → 16px).
- Overlapping projects in dense clusters (OH, WI, PA, TX, IN, GA, VA) have manually adjusted coordinates for visual separation (~25px minimum between marker centers).

### Styling

All styles are inline JS objects. Two Google Fonts loaded via `<link>` tags rendered by the component: **Syne** (headings) and **JetBrains Mono** (body/data). Dark theme throughout. No CSS files or styling libraries — everything is inline.

- **`F`** — Font family shorthand for JetBrains Mono (body/data text). Used throughout JSX.
- **`D`** — Font family shorthand for Syne (headings). Used in `h1`/`h2` elements.
- **`S`** — Style helper object defined inside `FusedDashboard()`. Contains `card`, `badge(color)`, and `btn(active)` factories used across sidebar/company cards.

## UI Modes

1. **Map + Project Sidebar** (default) — GeoJSON state outlines (uniform dark fill), clickable graduated-symbol project markers with capacity labels, sidebar with project list and detail panel showing electricity rates.
2. **Companies View** — Toggle via header button. Companies ranked by project involvement count with expandable financial detail.

## Key State Variables

- `sel` — Selected project ID
- `hov` — Hovered state abbreviation
- `fSt` — Status filter ("all", "Operational", "Under Construction", "Announced", "Planned")
- `companyView` — Toggle between map and companies view (switches grid from `1fr 380px` to `1fr`)
- `selCompany` — Selected company ticker in companies view
- `companyProjects` — `useMemo`-derived map of `{ticker: [project, ...]}` counting how many projects each company appears in. Used in both sidebar and companies view.

## Working with This Codebase

- Data lives in `dc-data.js`; rendering lives in `Data center dashboard.jsx` (~315 lines). Edit data separately from rendering logic.
- Capacity and investment are stored as display strings (`"1.2 GW"`, `"$100B+"`). Use `parseMW()` to extract numeric MW values.
- When adding new projects, provide real `lat`/`lng` — the Albers projection handles placement. Check dense clusters (OH, WI, PA, TX, IN, GA, VA) for coordinate separation (~25px min between markers). At scale 1070: 1° lat ≈ 65-75px, 1° lng ≈ 50-60px.
- The `statCol()` function maps status strings to colors — add explicit cases for any new statuses.
- The ticker validation check in `dc-data.js` runs in dev mode and logs errors for broken company references. Always check the browser console after adding/modifying projects.
- The CSV file (`Copy of Data_Centers_Database - FracTracker Data Centers.csv`) is an external FracTracker dataset (~1,358 rows) not currently consumed by the dashboard.

## Documentation

- `docs/brainstorms/` — Feature exploration documents
- `docs/plans/` — Implementation plans
- `docs/solutions/` — Solved problem write-ups with root cause analysis
