# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive React dashboard mapping major US AI data center projects and the public companies involved. No build system, package manager, or test framework is configured — the repo contains only source files.

## Key Files

- **`Data center dashboard.jsx`** — Single self-contained React component (`FusedDashboard`). Contains all data, styling, and UI logic inline. Uses only `useState` and `useMemo` from React (no external dependencies beyond React itself).
- **`Copy of Data_Centers_Database - FracTracker Data Centers.csv`** — External dataset (~1,358 rows) of US data center facilities from FracTracker. Not currently consumed by the dashboard component.

## Architecture

The dashboard is a single `FusedDashboard` default export with three inline data structures:

- **`COMPANIES`** — Keyed by ticker symbol. Financial data (price, market cap, forward P/E, revenue estimates, margins) and data-center-specific metrics (DC revenue %, liquid cooling growth, backlog).
- **`PROJECTS`** — Array of 17 major DC projects. Each has geo coordinates, capacity/investment info, and a `companies` array linking to `COMPANIES` entries with project-specific roles.
- **`SP` / `SL` / `ELEC`** — SVG path data for a US state map, state label coordinates, and electricity rates by state (¢/kWh).

The map renders as an inline SVG (not Leaflet/Mapbox). Project markers are positioned via `geoSvg()` which converts lat/lng to SVG coordinates using hand-tuned state center offsets.

## UI Modes

1. **Map + Project Sidebar** (default) — Click a map marker or sidebar item to see project details and linked companies with expandable financial cards.
2. **Companies View** — Toggle via header button. Shows all companies ranked by project involvement count, with expandable detail including every project they participate in.

## Styling

All styles are inline JS objects. Uses two Google Fonts loaded via `<link>` in the component: Syne (headings) and JetBrains Mono (body/data). Dark theme with `#060a13` background. No CSS files.

## Running

This component must be imported into a React application. There is no local dev server, `package.json`, or build configuration in this repo. To run it, embed it in a React project (e.g., Vite + React or Create React App) and render `<FusedDashboard />`.
